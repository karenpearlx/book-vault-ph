import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';

async function fetchTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  return res.json();
}

async function backup() {
  const date = new Date().toISOString().split('T')[0];
  const backupDir = '/home/kit/book-vault-backups';
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  console.log('Fetching books...');
  const books = await fetchTable('books');
  
  console.log('Fetching settings...');
  const settings = await fetchTable('settings');
  
  const data = { books, settings, backed_up_at: new Date().toISOString() };
  
  const filename = `backup-${date}.json`;
  const filepath = path.join(backupDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Backup saved: ${filepath}`);
  console.log(`Books: ${books.length}, Settings: ${settings.length}`);
  
  // Also update latest.json
  fs.writeFileSync(path.join(backupDir, 'latest.json'), JSON.stringify(data, null, 2));
  
  // Keep only last 30 backups
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  for (const f of files.slice(30)) {
    fs.unlinkSync(path.join(backupDir, f));
    console.log(`Deleted old backup: ${f}`);
  }
}

backup().catch(console.error);
