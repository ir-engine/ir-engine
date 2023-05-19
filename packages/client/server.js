import { join } from 'path';
import { readFileSync } from 'fs';
import Koa from '@feathersjs/koa';
import serve from 'koa-static';
import { path as packageRoot } from 'app-root-path';
import { createServer } from 'https';
import { createServer as _createServer } from 'http';

const app = new Koa();
const PORT = process.env.HOST_PORT || 3000;
const HTTPS = process.env.VITE_LOCAL_BUILD ?? false;

app.use(serve(join(packageRoot, 'packages', 'client', 'dist'), {
  gzip: true,
  setHeaders: (res) => {
    res.set('Origin-Agent-Cluster', '?1')
  }
}));

app.use(async (ctx) => {
  await ctx.sendFile(join(packageRoot, 'packages', 'client', 'dist', 'index.html'));
});

app.listen = function () {
  let server;
  if (HTTPS) {
    const key = readFileSync('../../certs/key.pem');
    const cert = readFileSync('../../certs/cert.pem');
    server = createServer({key: key, cert: cert }, this.callback());
  } else {
    server = _createServer(this.callback());
  }
  return server.listen.apply(server, arguments);
};

app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port: ${PORT}`));
