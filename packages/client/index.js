const { createServer } = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('../../certs/key.pem'),
  cert: fs.readFileSync('../../certs/cert.pem')
};

app.prepare().then(() => {
  if (dev === true) {
    createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      if (parsedUrl.pathname === '/healthcheck') {
        res.sendStatus(200);
      } else {
        handle(req, res, parsedUrl);
      }
    }).listen(5000, err => {
      if (err) throw err;
      console.log('Client ready on https://localhost:3000');
    });
  } else {
    http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      if (parsedUrl.pathname === '/healthcheck') {
        res.sendStatus(200);
      } else {
        handle(req, res, parsedUrl);
      }
    }).listen(5000, err => {
      if (err) throw err;
      console.log('Client ready on http://localhost:3000')
    })
  }
});
