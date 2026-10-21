// Local preview: serves dist/ and runs the contact handler at /api/contact (console delivery).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const root = new URL('../dist/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4321);

const out = await build({
  stdin: {
    contents: `export { handleContact } from './server/contact/handler';
export { memoryStore } from './server/contact/rate-limit';
export { consoleDelivery } from './server/contact/delivery';`,
    resolveDir: new URL('..', import.meta.url).pathname,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const store = mod.memoryStore();

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/contact') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
    const response = await mod.handleContact(request, { deliver: mod.consoleDelivery, store, salt: 'dev', clientIp: req.socket.remoteAddress ?? '' });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  let p = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!p.startsWith(root)) return res.writeHead(403).end();
  try {
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
  } catch {
    p = join(root, '404.html');
  }
  try {
    let body = await readFile(p);
    const type = types[extname(p)] ?? 'application/octet-stream';
    const headers = { 'Content-Type': type, 'Cache-Control': p.includes('/_assets/') || p.includes('/fonts/') ? 'public, max-age=31536000, immutable' : 'no-cache' };
    if (/text|javascript|svg|json|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
    res.writeHead(p.endsWith('404.html') ? 404 : 200, headers).end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`Preview on http://localhost:${port}`));
