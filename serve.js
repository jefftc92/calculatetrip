// Tiny static file server for local development.
// Production hosting (Replit static deploy) serves dist/ directly.

const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT) || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const candidates = [
    path.join(DIST, url),
    path.join(DIST, url, 'index.html'),
    path.join(DIST, '404.html'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' })
      fs.createReadStream(p).pipe(res)
      return
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end('<h1>404</h1>')
}).listen(PORT, '0.0.0.0', () => console.log(`http://localhost:${PORT}`))
