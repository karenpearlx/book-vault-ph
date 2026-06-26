#!/usr/bin/env node
/**
 * Backup script for The Book Vault PH
 * Exports books, blog_posts, blog_keywords, blog_categories to JSON
 * Run: node scripts/backup.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'backups');

// Read config
const configPath = path.join(ROOT, 'config.js');
const configText = fs.readFileSync(configPath, 'utf8');
const urlMatch = configText.match(/SUPABASE_URL\s*:\s*['"]([^'"]+)['"]/);
const keyMatch = configText.match(/SUPABASE_ANON_KEY\s*:\s*['"]([^'"]+)['"]/);

if (!urlMatch || !keyMatch) {
  console.error('❌ Could not read Supabase credentials from config.js');
  process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

const TABLES = ['books', 'blog_posts', 'blog_keywords', 'blog_categories', 'analytics', 'orders'];

async function backup() {
  // Create backup directory if needed
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
  
  console.log(`📦 Starting backup at ${new Date().toISOString()}`);
  
  const data = {};
  
  for (const table of TABLES) {
    try {
      const { data: rows, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`⚠️  ${table}: ${error.message}`);
        data[table] = [];
      } else {
        data[table] = rows || [];
        console.log(`✓ ${table}: ${rows?.length || 0} rows`);
      }
    } catch (err) {
      console.warn(`⚠️  ${table}: ${err.message}`);
      data[table] = [];
    }
  }
  
  // Write backup file
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved to ${backupFile}`);
  
  // Also write latest.json for easy access
  const latestFile = path.join(BACKUP_DIR, 'latest.json');
  fs.writeFileSync(latestFile, JSON.stringify(data, null, 2));
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Books: ${data.books?.length || 0}`);
  console.log(`   Blog posts: ${data.blog_posts?.length || 0}`);
  console.log(`   Keywords: ${data.blog_keywords?.length || 0}`);
  console.log(`   Categories: ${data.blog_categories?.length || 0}`);
  console.log(`   Analytics: ${data.analytics?.length || 0}`);
  console.log(`   Orders: ${data.orders?.length || 0}`);
  
  // Git commit if in repo
  try {
    process.chdir(ROOT);
    execSync('git add backups/', { stdio: 'pipe' });
    execSync(`git commit -m "backup: ${timestamp}"`, { stdio: 'pipe' });
    console.log('\n✓ Committed to git');
    
    // Try to push
    try {
      execSync('git push', { stdio: 'pipe' });
      console.log('✓ Pushed to GitHub');
    } catch {
      console.log('⚠️  Could not push (run git push manually)');
    }
  } catch {
    console.log('\n⚠️  No git changes to commit');
  }
  
  console.log('\n✅ Backup complete!');
}

backup().catch(err => {
  console.error('❌ Backup failed:', err);
  process.exit(1);
});
