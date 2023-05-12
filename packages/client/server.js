const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const serve = require('koa-static');
const packageRoot = require('app-root-path').path;
const https = require('https');
const http = require('http');

const app = new Koa();
const PORT = process.env.HOST_PORT || 3000;
const HTTPS = process.env.VITE_LOCAL_BUILD ?? false;

app.use(serve(path.join(packageRoot, 'packages', 'client', 'dist'), {
  gzip: true,
  setHeaders: (res) => {
    res.set('Origin-Agent-Cluster', '?1')
  }
}));

app.use(async (ctx) => {
  await ctx.sendFile(path.join(packageRoot, 'packages', 'client', 'dist', 'index.html'));
});

app.listen = function () {
  let server;
  if (HTTPS) {
    const key = fs.readFileSync('../../certs/key.pem');
    const cert = fs.readFileSync('../../certs/cert.pem');
    server = https.createServer({key: key, cert: cert }, this.callback());
  } else {
    server = http.createServer(this.callback());
  }
  return server.listen.apply(server, arguments);
};

app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port: ${PORT}`));
