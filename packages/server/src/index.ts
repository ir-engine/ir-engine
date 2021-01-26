import appRootPath from 'app-root-path';
import fs from 'fs';
import https from 'https';
import path from 'path';
import app from './app';
import logger from './app/logger';
import config from './config';
import psList from 'ps-list';
import sys from 'sys';
import { exec } from 'child_process';

/**
 * @param status
 */

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').');
});

(async (): Promise<void> => {
  if (process.env.KUBERNETES !== 'true') {
    const processList = await (await psList()).filter(e => {
      const regexp = /docker-compose up|docker-proxy|mysql/gi;
      return e.cmd.match(regexp);
    });
    const dockerProcess = processList.find(
        c => c.cmd.match(/docker-compose/)
    );
    const dockerProxy = processList.find(
        c => c.cmd.match(/docker-proxy/)
    );
    const processMysql = processList.find(
        c => c.cmd.match(/mysql/)
    );
    let databaseService = (dockerProcess && dockerProxy) || processMysql;

    if (!databaseService) {

      // Check for child process with mac OSX
        exec("docker ps | grep mariadb", function(err, stdout, stderr) {
          if(stdout.includes("mariadb")){
            (databaseService as any) = true;
          }else {
            throw new Error('\x1b[33mError: DB proccess is not running or Docker is not running!. If you are in local development, please run xr3ngine/scripts/start-db.sh and restart server\x1b[0m');
          }
        });
      }
  }
})();

// SSL setup
const useSSL = process.env.NODE_ENV !== 'production' && fs.existsSync(path.join(appRootPath.path, 'certs', 'key.pem'));

const certOptions = {
  key: useSSL && process.env.NODE_ENV !== 'production' ? fs.readFileSync(path.join(appRootPath.path, 'certs', 'key.pem')) : null,
  cert: useSSL && process.env.NODE_ENV !== 'production' ? fs.readFileSync(path.join(appRootPath.path, 'certs', 'cert.pem')) : null
};
if (useSSL) logger.info('Starting server with HTTPS');
else logger.warn('Starting server with NO HTTPS, if you meant to use HTTPS try \'npm run generate-certs\'');
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
  ? https.createServer(certOptions, app).listen(port)
  : app.listen(port);

if (useSSL === true) app.setup(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);
// if (process.env.NODE_ENV === 'production' && fs.existsSync('/var/log')) {
//   try {
//     console.log("Writing access log to ", '/var/log/api.access.log');
//     const access = fs.createWriteStream('/var/log/api.access.log');
//     process.stdout.write = process.stderr.write = access.write.bind(access);
//     console.log('Log file write setup successfully');
//   } catch(err) {
//     console.log('access log write error');
//     console.log(err);
//   }
// } else {
//   console.warn("Directory /var/log not found, not writing access log");
// }
server.on('listening', () =>
  logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
);

