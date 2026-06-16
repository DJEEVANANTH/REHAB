import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gym_coach_key_998877';

// ─── Supabase Admin Client (service role — full DB access) ─────────────────
const supabaseUrl  = process.env.SUPABASE_URL  || '';
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

// Middlewares
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// DB HELPER METHODS (all backed by Supabase PostgreSQL)
// ─────────────────────────────────────────────────────────────────────────────
const DB = {
  findUserByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('findUserByEmail error:', error.message);
    }
    return data || null;
  },

  createUser: async (userData: any) => {
    const id = `u_${Date.now()}`;
    const row = {
      id,
      name:           userData.name,
      email:          userData.email,
      profile_image:  userData.profileImage  || userData.profile_image  || '',
      login_provider: userData.loginProvider || userData.login_provider || 'otp',
      joined_date:    userData.joinedDate    || userData.joined_date    || '',
      username:       userData.username      || '',
      google_id:      userData.googleId      || userData.google_id      || '',
    };
    const { data, error } = await supabase.from('users').insert(row).select().single();
    if (error) throw new Error(`createUser failed: ${error.message}`);
    return data;
  },

  updateUserLastLogin: async (email: string) => {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);
    if (error) console.error('updateUserLastLogin error:', error.message);
  },

  saveOTP: async (email: string, otp: string, expiresAt: Date) => {
    // Clear old OTPs for this email first (single-use enforcement)
    await supabase.from('otps').delete().eq('email', email);
    const { error } = await supabase.from('otps').insert({
      email,
      otp,
      expires_at: expiresAt.toISOString(),
    });
    if (error) throw new Error(`saveOTP failed: ${error.message}`);
  },

  verifyAndConsumeOTP: async (email: string, otp: string) => {
    const { data, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .single();

    // Always delete the OTP for this email (single-use, even on failure)
    await supabase.from('otps').delete().eq('email', email);

    if (error || !data) return null;
    return data;
  },

  saveSession: async (userId: string, token: string) => {
    const { error } = await supabase.from('sessions').insert({
      user_id:    userId,
      token,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(`saveSession failed: ${error.message}`);
  },

  findSession: async (token: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('findSession error:', error.message);
    }
    return data || null;
  },

  removeSession: async (token: string) => {
    await supabase.from('sessions').delete().eq('token', token);
  },

  clearOldSessions: async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('sessions').delete().lt('created_at', sevenDaysAgo);
    await supabase.from('otps').delete().lt('expires_at', new Date().toISOString());
  },
};

// Periodic session cleanser (hourly)
setInterval(() => {
  DB.clearOldSessions().catch(err => console.error('Session cleanser error:', err));
}, 60 * 60 * 1000);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
interface AuthenticatedRequest extends Request {
  user?: any;
}

async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  const activeSession = await DB.findSession(token);
  if (!activeSession) {
    return res.status(403).json({ error: 'Session has expired or logged out' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token' });
    req.user = user;
    next();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Send OTP
app.post('/api/auth/otp/send', async (req: Request, res: Response) => {
  const { email, mode } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const existingUser = await DB.findUserByEmail(email);

  if (mode === 'login' && !existingUser) {
    return res.status(404).json({
      error: 'account_missing',
      message: "You don't have an account",
      subMessage: 'Please create an account first',
    });
  }

  if (mode === 'signup' && existingUser) {
    return res.status(400).json({
      error: 'duplicate_account',
      message: 'An account with this email already exists',
      subMessage: 'Please log in instead',
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await DB.saveOTP(email, otp, expiresAt);

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  let isSandbox = true;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.SMTP_PORT || '587'),
        secure: parseInt(process.env.SMTP_PORT || '587') === 465,
        auth:   { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from:    `"Gym AI Coach Team" <${smtpUser}>`,
        to:      email,
        subject: 'Gym AI Coach App - Login Verification OTP',
        text:    `Your OTP is: ${otp}\n\nThis OTP expires in 5 minutes.\n\nGym AI Coach Team`,
      });
      isSandbox = false;
    } catch (err: any) {
      console.error('SMTP failed, using sandbox mode:', err.message);
    }
  }

  if (isSandbox) {
    console.log('\n=======================================');
    console.log(`🔑 DEV MODE - OTP VERIFICATION`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP:   ${otp}`);
    console.log('=======================================\n');
  }

  res.status(200).json({ message: 'OTP sent!', isSandbox, otp: isSandbox ? otp : undefined });
});

// 2. Verify OTP
app.post('/api/auth/otp/verify', async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const record = await DB.verifyAndConsumeOTP(email, otp);
  if (!record) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  const expiry = new Date(record.expires_at).getTime();
  if (Date.now() > expiry) {
    return res.status(400).json({ error: 'OTP expired' });
  }

  let user = await DB.findUserByEmail(email);
  if (!user) {
    const username  = `@${email.split('@')[0]}_fit`;
    const fullName  = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    user = await DB.createUser({
      name:           fullName,
      email,
      loginProvider:  'otp',
      joinedDate:     new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      username,
    });
  } else {
    await DB.updateUserLastLogin(email);
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  await DB.saveSession(user.id, token);

  res.status(200).json({ message: 'Login successful!', token, user: mapUser(user) });
});

// 3. Google OAuth Login
app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Credential token is required' });

  try {
    const parts = credential.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    if (!payload?.email) throw new Error('No email in payload');

    const { email, name, picture, sub } = payload;
    let user = await DB.findUserByEmail(email);

    if (!user) {
      user = await DB.createUser({
        name,
        email,
        profileImage:  picture || '',
        loginProvider: 'google',
        joinedDate:    new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        username:      `@${email.split('@')[0]}`,
        googleId:      sub,
      });
    } else {
      await DB.updateUserLastLogin(email);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    await DB.saveSession(user.id, token);

    res.status(200).json({ message: 'Google login successful!', token, user: mapUser(user) });
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// 4. Logout
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) await DB.removeSession(token);
  res.status(200).json({ message: 'Logged out successfully' });
});

// 5. Session Check
app.get('/api/auth/session', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = await DB.findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json({ authenticated: true, user: mapUser(user) });
});

// 6. Client Config (Google Client ID)
app.get('/api/auth/config', (req: Request, res: Response) => {
  res.status(200).json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  });
});

// 6.5. Resolve username to email (bypasses RLS using service role)
app.post('/api/auth/resolve-username', async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (data && data.email) {
      return res.status(200).json({ email: data.email });
    } else {
      return res.status(404).json({ error: 'Username not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Signup route (email & password + profile details with auto-confirm)
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { 
    email, 
    password, 
    fullName, 
    username, 
    phoneNumber, 
    location, 
    fitnessGoal, 
    age, 
    weight, 
    height, 
    bodyFat 
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log(`👤 Registering user: ${email}`);
    // Create the user using Supabase Auth Admin client with email_confirm: true
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username: username
      }
    });

    if (authErr) {
      console.error(`❌ Supabase Admin createUser failed:`, authErr.message);
      return res.status(400).json({ error: authErr.message });
    }

    if (!authUser?.user) {
      return res.status(500).json({ error: 'User creation failed' });
    }

    const userId = authUser.user.id;
    console.log(`✅ Auth user created successfully. ID: ${userId}. Syncing profile details...`);

    // Update the profile row created by the DB trigger
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        phone_number: phoneNumber || '',
        location: location || '',
        fitness_goal: fitnessGoal || 'Hypertrophy & Strength',
        age: age ? parseInt(age) : 28,
        weight: weight ? parseFloat(weight) : 78,
        height: height ? parseInt(height) : 182,
        body_fat: bodyFat ? parseFloat(bodyFat) : 14,
      })
      .eq('id', userId);

    if (profileErr) {
      console.error('⚠️ Warning: Failed to update public profile details:', profileErr.message);
    } else {
      console.log('✅ Public profile sync complete.');
    }

    res.status(200).json({ message: 'User registered successfully', user: authUser.user });
  } catch (err: any) {
    console.error('Signup exception:', err);
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

// ─── Helper: Normalize DB row → frontend user shape ──────────────────────────
function mapUser(row: any) {
  return {
    id:            row.id,
    name:          row.name,
    email:         row.email,
    profileImage:  row.profile_image  || '',
    loginProvider: row.login_provider || 'otp',
    joinedDate:    row.joined_date    || '',
    username:      row.username       || '',
    googleId:      row.google_id      || '',
    phoneNumber:   row.phone_number   || '',
    location:      row.location       || '',
    age:           row.age            || 28,
    weight:        row.weight         || 78,
    height:        row.height         || 182,
    bodyFat:       row.body_fat       || 14,
    fitnessGoal:   row.fitness_goal   || 'Hypertrophy & Strength',
    lastLogin:     row.last_login     || null,
  };
}

// Startup: clean old sessions
DB.clearOldSessions()
  .then(() => console.log('🧹 Startup cleanup done.'))
  .catch(console.error);

// ── Health check endpoint (required by Render) ─────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'Rehab API', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rehab API Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: Supabase PostgreSQL (${supabaseUrl})`);
});
