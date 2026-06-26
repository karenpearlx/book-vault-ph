const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/books?status=eq.coming_soon&select=id,title,author`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const books = await res.json();
  
  console.log('Searching for: snowdrops, mothers, daughters, cornish, erica james, miller\n');
  
  for (const book of books) {
    const t = book.title.toLowerCase();
    const a = book.author.toLowerCase();
    if (t.includes('snow') || t.includes('mother') || t.includes('daughter') || 
        t.includes('cornish') || a.includes('erica james') || a.includes('miller')) {
      console.log(`${book.title} by ${book.author} [id: ${book.id}]`);
    }
  }
}
run();
