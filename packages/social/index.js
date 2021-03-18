const { createServer } = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  if (dev === true) {
    const appRootPath = '../../';
    const certPath = path.join(appRootPath, process.env.CERT ?? 'certs/cert.pem');
    const certKeyPath = path.join(appRootPath, process.env.KEY ?? 'certs/key.pem');
    const httpsOptions = {
      key: fs.readFileSync(certKeyPath),
      cert: fs.readFileSync(certPath)
    };

    createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      if (parsedUrl.pathname === '/healthcheck') {
        res.sendStatus(200);
      } else {
        handle(req, res, parsedUrl);
      }
    }).listen(3000, err => {
      if (err) throw err;
      console.log('Client ready on https://127.0.0.1:3000');
    });
  } else {
    http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      if (parsedUrl.pathname === '/healthcheck') {
        res.sendStatus(200);
      } else {
        handle(req, res, parsedUrl);
      }
    }).listen(3000, err => {
      if (err) throw err;
      console.log('Client ready on http://127.0.0.1:3000')
    })
  }
});
