import logger from './logger'
import app from './app'
import config from './config'
import fs from 'fs'
import https from 'https'
import path from 'path'

// SSL setup
const useSSL = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, '../certs/key.pem'))

const certOptions = {
  key: useSSL && process.env.NODE_ENV !== 'production' ? fs.readFileSync(path.join(__dirname, '../certs/key.pem')) : null,
  cert: useSSL && process.env.NODE_ENV !== 'production' ? fs.readFileSync(path.join(__dirname, '../certs/cert.pem')) : null
}
if (useSSL) console.log("Starting server with HTTPS")
else console.warn("No certs found, try 'npm run generate-certs'")
const port = config.server.port

// http redirects for development
if (process.env.NODE_ENV !== 'production') {
  app.use(function (req, res, next) {
    if (req.secure) {
      // request was via https, so do no special handling
      next();
    } else {
      // request was via http, so redirect to https
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

const server = useSSL ?
  https.createServer(certOptions, app).listen(port) :
  app.listen(port)

app.setup(server)

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
)

