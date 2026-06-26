const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

async function searchCover(title, author) {
  const query = encodeURIComponent(`${title} ${author}`);
  const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
  const data = await res.json();
  if (data.docs && data.docs[0] && data.docs[0].cover_i) {
    return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
  }
  return null;
}

async function run() {
  // Get the books we just added
  const res = await fetch(`${SUPABASE_URL}/rest/v1/books?or=(title.ilike.*Snowdrops*,title.ilike.*Starfish*)&select=id,title,author,cover_url`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const books = await res.json();
  console.log('Found books:', books.map(b => b.title));
  
  for (const book of books) {
    const coverUrl = await searchCover(book.title, book.author);
    if (coverUrl) {
      console.log(`Found cover for ${book.title}: ${coverUrl}`);
      const upRes = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${book.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ cover_url: coverUrl })
      });
      console.log(upRes.ok ? '✓ Updated' : '✗ Failed');
    } else {
      console.log(`No cover found for ${book.title}`);
    }
  }
}

run();
