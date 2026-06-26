const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

const titles = [
  "grey",
  "ambassador's mission",
  "us",
  "the hate u give",
  "if i stay",
  "after you",
  "day one",
  "suspicion of mr whicher",
  "the time traveler's wife",
  "this is going to hurt",
  "echo of the dead",
  "chasing dreams",
  "room",
  "this lie will kill you",
  "let it snow",
  "the law of innocence",
  "the death collector",
  "the star of kazan",
  "the book of souls",
  "hold tight",
  "insidious intent",
  "the burning air",
  "blood rites",
  "man and boy",
  "last letter home",
  "twelve days of christmas",
  "secret service",
  "unholy murder",
  "hide and seek",
  "things we never say",
  "one christmas eve",
  "midnight kiss",
  "the miller's dance",
  "final minute",
  "dangerous games",
  "birdsong",
  "snowdrops",
  "lie maker",
  "good cop bad cop",
  "the spear of atlantis",
  "russian doll",
  "fear the worst",
  "no child of mine",
  "the secret of crickley hall",
  "under the eagle",
  "mothers daughters",
  "escape to the little cornish",
  "the other queen",
  "whiskey beach",
  "the memory keeper's daughter",
  "minding frankie",
  "last chance saloon",
  "after anna",
  "one enchanted evening",
  "best kept secret",
  "alex",
  "thin air",
  "the confession",
  "lie beside me",
  "a delicate truth"
];

async function run() {
  // Get all coming_soon books
  const res = await fetch(`${SUPABASE_URL}/rest/v1/books?status=eq.coming_soon&select=id,title,author`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const books = await res.json();
  console.log(`Found ${books.length} coming_soon books`);
  
  // Find matches
  const toUpdate = [];
  for (const book of books) {
    const titleLower = book.title.toLowerCase();
    for (const search of titles) {
      if (titleLower.includes(search.toLowerCase())) {
        toUpdate.push({ id: book.id, title: book.title, author: book.author });
        break;
      }
    }
  }
  
  console.log(`\nMatched ${toUpdate.length} books:`);
  toUpdate.forEach(b => console.log(`  - ${b.title} by ${b.author}`));
  
  // Update each
  let updated = 0;
  for (const book of toUpdate) {
    const upRes = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${book.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: 'on_hand' })
    });
    if (upRes.ok) updated++;
  }
  
  console.log(`\nUpdated ${updated} books to on_hand`);
}

run();
