// Static file server with on-demand comparison rendering.
//
// dist/ holds the pre-rendered site (the ~60K "meaningful" comparison pairs
// among them). Any other valid two-resort matchup — e.g. a cross-country,
// cross-brand pick from the compare tool — is rendered at request time via
// build.js's renderComparePage and cached in memory, so no picker selection
// ever 404s. Production runs this server (Replit autoscale deployment).

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
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

// build.js is loaded lazily on the first dynamic request: it pulls in the full
// dataset and overview generator, which static-file traffic never needs.
let site = null
function getSite() {
  if (!site) site = require('./build')
  return site
}

const dynamicCache = new Map()

async function tryDynamicCompare(url) {
  const m = url.match(/^\/compare\/([a-z0-9-]+)\/?$/)
  if (!m) return null
  if (dynamicCache.has(m[1])) return dynamicCache.get(m[1])
  const html = await getSite().renderComparePage(m[1])
  if (html) dynamicCache.set(m[1], html)
  return html
}

http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const candidates = [
    path.join(DIST, url),
    path.join(DIST, url, 'index.html'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' })
      fs.createReadStream(p).pipe(res)
      return
    }
  }

  try {
    const html = await tryDynamicCompare(url)
    if (html) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
  } catch (err) {
    console.error('dynamic render failed:', url, err.message)
  }

  const notFound = path.join(DIST, '404.html')
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(notFound).pipe(res)
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end('<h1>404</h1>')
}).listen(PORT, '0.0.0.0', () => console.log(`http://localhost:${PORT}`))
