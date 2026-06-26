const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

// Using ISBN-based covers which are more reliable
const updates = [
  { 
    title: 'Snowdrops', 
    cover_url: 'https://covers.openlibrary.org/b/isbn/9781848874534-L.jpg'
  },
  { 
    title: 'Escape to the Little Cornish Isles', 
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780008253417-L.jpg'
  }
];

async function run() {
  for (const u of updates) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/books?title=ilike.*${encodeURIComponent(u.title)}*&select=id,title`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const books = await res.json();
    
    for (const book of books) {
      const upRes = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${book.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ cover_url: u.cover_url })
      });
      console.log(`${upRes.ok ? '✓' : '✗'} ${book.title}`);
    }
  }
}

run();
