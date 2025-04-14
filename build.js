// Vercel build script
const { exec } = require('child_process');
const fs = require('fs');

// Run the build commands sequentially
console.log('Building client with Vite...');
exec('npx vite build', (err, stdout, stderr) => {
  if (err) {
    console.error('Error building client:', stderr);
    process.exit(1);
  }
  
  console.log('Client build successful');
  console.log('Building server with esbuild...');
  
  exec('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', 
    (err, stdout, stderr) => {
      if (err) {
        console.error('Error building server:', stderr);
        process.exit(1);
      }
      
      console.log('Server build successful');
      
      // Create a Vercel-specific entry point
      const vercelHandler = `
        import { createServer } from 'http';
        import { app } from './dist/index.js';
        
        export default function handler(req, res) {
          // Forward the request to Express
          const server = createServer(app);
          server.emit('request', req, res);
        }
      `;
      
      fs.writeFileSync('api/index.js', vercelHandler);
      console.log('Created Vercel serverless function handler');
    });
});