const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.473225e7-dd78-4f6f-b634-c09b8c8ad0c4`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ status: 'on_hand' })
  });
  console.log(res.ok ? 'Updated Mothers and Daughters to on_hand' : 'Failed');
}
run();
