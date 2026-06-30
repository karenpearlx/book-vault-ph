import fs from 'fs';

// Read backup
const backup = JSON.parse(fs.readFileSync('backups/latest.json', 'utf8'));
const books = backup.books;

// Supabase config
const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

async function restoreCovers() {
  let updated = 0;
  let failed = 0;
  
  for (const book of books) {
    if (!book.id || !book.cover_url) continue;
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${book.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ cover_url: book.cover_url })
    });
    
    if (res.ok) {
      updated++;
      process.stdout.write(`\rUpdated ${updated}/${books.length}`);
    } else {
      failed++;
      console.error(`\nFailed: ${book.title}`);
    }
  }
  
  console.log(`\n\nDone! Updated: ${updated}, Failed: ${failed}`);
}

restoreCovers();
