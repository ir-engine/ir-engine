const { join } = require('path');
const { readFileSync } = require('fs');
const Koa = require('@feathersjs/koa');
const serve = require('koa-static');
const sendFile = require('koa-send')
const { path: packageRoot } = require('app-root-path');
const { createServer } = require('https');
const { createServer: _createServer } = require('http');


const app = new Koa.koa();
const PORT = process.env.HOST_PORT || 3000;
const HTTPS = process.env.VITE_LOCAL_BUILD ?? false;

app.use(serve(join(packageRoot, 'packages', 'client', 'dist'), {
  brotli: true,
  setHeaders: (ctx) => {
    ctx.setHeader('Origin-Agent-Cluster', '?1')
  }
}));

app.use(async (ctx) => {
  await sendFile(ctx, join('dist', 'index.html'));
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
