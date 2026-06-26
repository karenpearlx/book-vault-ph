const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

const books = [
  {
    title: "Snowdrops",
    author: "A.D. Miller",
    genre: "Thriller",
    summary: "A riveting psychological drama set over one Moscow winter. A thirty-something English lawyer's moral compass is spun by the seductive opportunities of post-communist Russia - a land of corruption and kindness, magical dachas and debauched nightclubs. A chilling story of love and moral freefall, shortlisted for the Man Booker Prize.",
    rating: 3.3,
    price_sell: 220,
    price_bought: 50,
    condition: "Like New",
    status: "on_hand",
    quantity: 1,
    sale_status: "available",
    goodreads_url: "https://www.goodreads.com/book/show/9579671-snowdrops",
    cover_url: "https://covers.openlibrary.org/b/id/7225630-L.jpg"
  },
  {
    title: "Escape to the Little Cornish Isles: The Starfish Studio",
    author: "Phillipa Ashley",
    genre: "Romance",
    summary: "A gorgeous Cornish romance from the Sunday Times bestselling author. On a whim, Dan suggests that he and Poppy give up their jobs and move to an island. A heartwarming story of new beginnings, second chances, and finding love in the most unexpected places. Perfect for fans of Katie Fforde and Sue Moorcroft.",
    rating: 4.4,
    price_sell: 200,
    price_bought: 50,
    condition: "Like New",
    status: "on_hand",
    quantity: 1,
    sale_status: "available",
    goodreads_url: "https://www.goodreads.com/book/show/39863095-summer-on-the-little-cornish-isles",
    cover_url: "https://covers.openlibrary.org/b/id/8477394-L.jpg"
  }
];

async function run() {
  for (const book of books) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(book)
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`✓ Added: ${book.title} by ${book.author}`);
    } else {
      const err = await res.text();
      console.log(`✗ Failed: ${book.title} - ${err}`);
    }
  }
}

run();
