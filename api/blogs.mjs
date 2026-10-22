// Vercel serverless entry for the OGTool blog section.
// vercel.json routes /blogs, /blogs/<segment>, and /llms.txt here.
export { handleBlogs as default } from '../lib/blog-routes.mjs';
