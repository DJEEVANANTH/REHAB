/**
 * Run Supabase migration via the Management API (HTTPS)
 * This bypasses direct TCP connection to port 5432
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase project details
const PROJECT_REF = 'kthztrhmdoqtlmykrldt';

// We'll use the REST API via fetch
// The SQL needs to be run statement by statement via rpc or direct pg
// Since we don't have the service role key here, let's use the pg pooler via the 
// Supabase-provided connection string format with URL encoding

function httpsRequest(options: https.RequestOptions, body?: string): Promise<{status: number, data: string}> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode || 0, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function testConnection() {
  console.log('Testing HTTPS connectivity to Supabase...');
  try {
    const result = await httpsRequest({
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/rest/v1/',
      method: 'GET',
      headers: { 'apikey': 'placeholder' }
    });
    console.log(`✅ HTTPS connection to ${PROJECT_REF}.supabase.co works! Status: ${result.status}`);
    return true;
  } catch (err: any) {
    console.error('❌ HTTPS connection failed:', err.message);
    return false;
  }
}

testConnection().then(ok => {
  if (ok) {
    console.log('\nThe Supabase REST endpoint is reachable.');
    console.log('To run the migration, you need to:');
    console.log('1. Get your Service Role key from: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/api');
    console.log('2. Add SUPABASE_SERVICE_ROLE_KEY to your .env file');
    console.log('3. Re-run the migration');
  }
});
