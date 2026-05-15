// Native fetch

const supabaseUrl = 'https://xjjdphwxoegfxpudwpee.supabase.co';
const supabaseAnonKey = 'sb_publishable_oAfYgukNZr-SXFavk_8Uww_6r2Ras5N';

async function testSupabase() {
  console.log("Testing Supabase connection...");
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testSupabase();
