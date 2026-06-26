import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://vmjhpjvveoaroruzmbla.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM'
);

const { data, error } = await sb.from('books').select('id,title,cover_url').limit(5);
if (error) console.error(error);
else data.forEach(b => console.log(b.title, ':', b.cover_url ? 'HAS COVER' : 'NO COVER'));
