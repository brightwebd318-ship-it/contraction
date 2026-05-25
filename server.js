/**
 * ConstructFlow — Dev Server
 * Zero-dependency Node.js static file server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.pdf':  'application/pdf',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // Strip query string
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html><body style="font-family:sans-serif;padding:40px;background:#0a0a0f;color:#f0f0f8;text-align:center">
            <h2 style="color:#6366f1">404 — Page Not Found</h2>
            <p style="color:#9090a8">${urlPath}</p>
            <a href="/" style="color:#818cf8">← Back to Home</a>
          </body></html>
        `);
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.message);
      }
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Powered-By': 'ConstructFlow DevServer',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const line   = '─'.repeat(52);
  const blank  = ' '.repeat(52);
  console.log('\x1b[0m');
  console.log('\x1b[90m┌' + line + '┐\x1b[0m');
  console.log('\x1b[90m│\x1b[0m' + blank + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[1m\x1b[35m🏗️  ConstructFlow\x1b[0m \x1b[90m— Dev Server\x1b[0m' + ' '.repeat(24) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m' + blank + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[32m✓\x1b[0m  Local:    \x1b[36m\x1b[4mhttp://localhost:' + PORT + '\x1b[0m' + ' '.repeat(22) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[32m✓\x1b[0m  Network:  \x1b[36m\x1b[4mhttp://0.0.0.0:' + PORT + '\x1b[0m' + ' '.repeat(23) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m' + blank + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[90mPages:\x1b[0m' + ' '.repeat(46) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[33m→\x1b[0m  / ........................ Homepage' + ' '.repeat(16) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[33m→\x1b[0m  /login-client.html ....... Client Login' + ' '.repeat(12) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[33m→\x1b[0m  /login-contractor.html ... Contractor Login' + ' '.repeat(8) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[33m→\x1b[0m  /dashboard-client.html ... Client Dashboard' + ' '.repeat(8) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[33m→\x1b[0m  /dashboard-contractor.html Contractor Dash' + ' '.repeat(8) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m' + blank + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m  \x1b[90mPress Ctrl+C to stop\x1b[0m' + ' '.repeat(31) + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m│\x1b[0m' + blank + '\x1b[90m│\x1b[0m');
  console.log('\x1b[90m└' + line + '┘\x1b[0m');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\x1b[31m✗ Port ${PORT} is already in use. Kill the process using it and retry.\x1b[0m`);
  } else {
    console.error('\x1b[31m✗ Server error:\x1b[0m', err.message);
  }
  process.exit(1);
});
