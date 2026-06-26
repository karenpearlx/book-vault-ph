import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://vmjhpjvveoaroruzmbla.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM'
);

// Count how many have covers vs don't
const { data } = await sb.from('books').select('id,title,cover_url');
const withCover = data.filter(b => b.cover_url);
const withoutCover = data.filter(b => !b.cover_url);
console.log(`With cover: ${withCover.length}`);
console.log(`Without cover: ${withoutCover.length}`);
console.log('\nBooks WITH covers:');
withCover.slice(0,5).forEach(b => console.log('-', b.title));
