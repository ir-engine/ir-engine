import dotenv from 'dotenv-flow';
if (process.env.KUBERNETES !== 'true') {
  dotenv.config({
    path: appRootPath.path
  });
}

import appRootPath from 'app-root-path';
import fs from 'fs';
import https from 'https';
import path from 'path';
import app from './app';
import logger from '@xr3ngine/server-core/src/logger';
import config from '@xr3ngine/server-core/src/appconfig';
import psList from 'ps-list';

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').');
});

(async (): Promise<void> => {
  const key = process.platform === 'win32' ? 'name' : 'cmd';
  if (process.env.KUBERNETES !== 'true') {
    const processList = await (await psList()).filter(e => {
      const regexp = /docker-compose up|docker-proxy|mysql/gi;
      return e[key]?.match(regexp);
    });
    const dockerProcess = processList.find(
        c => c[key]?.match(/docker-compose/)
    );
    const dockerProxy = processList.find(
        c => c[key]?.match(/docker-proxy/)
    );
    const processMysql = processList.find(
        c => c[key]?.match(/mysql/)
    );
    const databaseService = (dockerProcess && dockerProxy) || processMysql;

    if (!databaseService) {

      // Check for child process with mac OSX
        // exec("docker ps | grep mariadb", (err, stdout, stderr) => {
        //   if(!stdout.includes("mariadb")){
        //     throw new Error('\x1b[33mError: DB proccess is not running or Docker is not running!. If you are in local development, please run xr3ngine/scripts/start-db.sh and restart server\x1b[0m');
        //   }
        // });
      }
  }
})();

// SSL setup
const certPath = path.join(appRootPath.path, process.env.CERT ?? 'certs/cert.pem');
const certKeyPath = path.join(appRootPath.path, process.env.KEY ?? 'certs/key.pem');
const useSSL = process.env.NOSSL !== 'true' && (process.env.LOCAL_BUILD === 'true' || process.env.NODE_ENV !== 'production') && fs.existsSync(certKeyPath);

const certOptions = {
  key: useSSL && (process.env.LOCAL_BUILD === 'true' || process.env.NODE_ENV !== 'production') ? fs.readFileSync(certKeyPath) : null,
  cert: useSSL && (process.env.LOCAL_BUILD === 'true' || process.env.NODE_ENV !== 'production') ? fs.readFileSync(certPath) : null
};
if (useSSL) logger.info('Starting server with HTTPS');
else logger.warn('Starting server with NO HTTPS, if you meant to use HTTPS try \'sudo bash generate-certs\'');
const port = config.server.port;

// http redirects for development
if (useSSL) {
  app.use((req, res, next) => {
    if (req.secure) {
      // request was via https, so do no special handling
      next();
    } else {
      // request was via http, so redirect to https
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

const server = useSSL
  ? https.createServer(certOptions as any, app).listen(port)
  : app.listen(port);

if (useSSL === true) app.setup(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);
server.on('listening', () =>
logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
);
