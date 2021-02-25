const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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
});
