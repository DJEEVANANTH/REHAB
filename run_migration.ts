/**
 * Supabase Migration Runner
 * Creates all tables and seeds existing users — runs over HTTPS (no port 5432 needed)
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL          = process.env.SUPABASE_URL || 'https://kthztrhmdoqtlmykrldt.supabase.co';
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ─── Existing users from fallback_database.json ───────────────────────────────
const SEED_USERS = [
  { id: 'u_1779957166978', name: 'Ragul Jee0709',   email: 'raguljee0709@gmail.com',          profile_image: 'https://lh3.googleusercontent.com/a/ACg8ocKccvG6qmkCfkYmoB_EhOVKJ76jyeo1zyXpgVNDoBU2z_edaA=s96-c', login_provider: 'google', joined_date: 'May 2026', username: '@raguljee0709',        google_id: '113768041647356663700' },
  { id: 'u_1779957402675', name: 'RAGUL G',          email: 'ragulg1032.sse@saveetha.com',      profile_image: 'https://lh3.googleusercontent.com/a/ACg8ocIwK8JAYv-UwSbNNnOw8CdMt5U433Y8u3IobYX5wcCm5hCzyiUi=s96-c', login_provider: 'google', joined_date: 'May 2026', username: '@ragulg1032.sse',       google_id: '111329089030171961479' },
  { id: 'u_1779970919288', name: 'Ragul Jee',        email: 'raguljee0409@gmail.com',          profile_image: 'https://lh3.googleusercontent.com/a/ACg8ocIZ1on8E6iTBGI028em_sTtofTYR58jVGNkSzH_vwtbxIsPHg=s96-c',  login_provider: 'google', joined_date: 'May 2026', username: '@raguljee0409',        google_id: '112585893247304103924' },
  { id: 'u_1779989525897', name: 'Google Athlete',   email: 'raguljee0408@gmail.com',          profile_image: 'https://lh3.googleusercontent.com/a/default-user',                                                     login_provider: 'google', joined_date: 'May 2026', username: '@raguljee0408',        google_id: 'google_oauth_sub_1029384756' },
  { id: 'u_1779996083957', name: 'Ragul Ganesan',    email: 'ganesanragul049@gmail.com',       profile_image: 'https://lh3.googleusercontent.com/a/ACg8ocJMGOqsEdcLXHrBPe08WMS60KeRx9zIg4Oa1asBJrFn_ouanA=s96-c', login_provider: 'google', joined_date: 'May 2026', username: '@ganesanragul049',      google_id: '108586176235433964097' },
  { id: 'u_1780047405201', name: 'Answar Vijes',     email: 'answarvijes@gmail.com',           profile_image: 'https://lh3.googleusercontent.com/a/ACg8ocKzA4SDblhgT-21NF8hMzuR0gzJ7UVS_pvtTSbjx2cBu4B-AsPl=s96-c', login_provider: 'google', joined_date: 'May 2026', username: '@answarvijes',          google_id: '107709455111071050004' },
];

async function run() {
  console.log('🚀 Connecting to Supabase...');
  console.log(`   URL: ${SUPABASE_URL}\n`);

  // ── Step 1: Verify connection ──────────────────────────────────────────────
  const { data: pingData, error: pingError } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (pingError) {
    if (pingError.code === '42P01') {
      // Table doesn't exist yet — expected before migration
      console.log('ℹ️  Tables not yet created. Please run the SQL migration first.');
      console.log('   See: supabase_migration.sql');
      console.log('\n📋 INSTRUCTIONS:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/kthztrhmdoqtlmykrldt/sql/new');
      console.log('   2. Open the file: supabase_migration.sql');
      console.log('   3. Copy all content and paste into the SQL editor');
      console.log('   4. Click "Run" — then re-run this script\n');
    } else {
      console.error('❌ Connection error:', pingError.message);
    }
    process.exit(1);
  }

  console.log('✅ Connected to Supabase successfully!\n');

  // ── Step 2: Seed users ────────────────────────────────────────────────────
  console.log(`📦 Seeding ${SEED_USERS.length} users from fallback_database.json...`);

  let inserted = 0;
  let skipped  = 0;

  for (const user of SEED_USERS) {
    const { error } = await supabase
      .from('users')
      .insert(user)
      .select();

    if (error) {
      if (error.code === '23505') { // unique_violation — already exists
        console.log(`   ⏭️  Skipped (already exists): ${user.email}`);
        skipped++;
      } else {
        console.error(`   ❌ Failed to insert ${user.email}:`, error.message);
      }
    } else {
      console.log(`   ✅ Inserted: ${user.name} <${user.email}>`);
      inserted++;
    }
  }

  console.log(`\n📊 Seed Results:`);
  console.log(`   ✅ Inserted: ${inserted}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   📝 Total:    ${SEED_USERS.length}`);

  // ── Step 3: Verify final count ────────────────────────────────────────────
  const { data: allUsers } = await supabase.from('users').select('id, name, email');
  console.log(`\n🗄️  Total users in database: ${allUsers?.length || 0}`);

  if (allUsers && allUsers.length > 0) {
    console.log('\n👤 Users:');
    allUsers.forEach(u => console.log(`   • ${u.name} <${u.email}>`));
  }

  console.log('\n✅ Migration and seeding complete!');
  console.log('   You can now start the server with: npm run dev\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
