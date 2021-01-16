import appRootPath from 'app-root-path';
import fs from 'fs';
import https from 'https';
import path from 'path';
import app from './app';
import logger from './app/logger';
import config from './config';
import psList from 'ps-list';
import psNode from 'ps-node';

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').');
});


(async () => {
  // console.log('PREVIOUS PROCESS LISTTTT',await psList());
  const processList = await (await psList()).filter(e => {
    
    const regexp = /start-db|start-agones|mysql/gi;
    return e.cmd.match(regexp) ;
  });
  console.log('PROCESS LISTTTT',processList);

  const processDocker = processList.find(
    c => c.cmd.match(/start-db/)
  );
  const processMysql = processList.find(
    c => c.cmd.match(/mysql/)
  );
  const processAgones = processList.find(
    c => c.cmd.match(/start-agones/)
  );
  console.log('ARE THAT WORKS?',processDocker,processMysql,processAgones);

  if (!processDocker) {
    console.log('\x1b[31m%s\x1b[33m%s\x1b[0m','Error:',' Could not find database. If you are in local development, please run xr3ngine/scripts/start-db.sh and restart server');
  } else if (!processMysql) {
    console.log('\x1b[31m%s\x1b[33m%s\x1b[0m','Error:',' Could not find database. If you are in local development, please run xr3ngine/scripts/start-db.sh and restart server');
  } else if (!processAgones) {
    console.log('\x1b[31m%s\x1b[33m%s\x1b[0m','Error:','Agones not running, please proceed into dir script and run sh start-agones.sh');
  }
    //=> [{pid: 3213, name: 'node', cmd: 'node test.js', ppid: 1, uid: 501, cpu: 0.1, memory: 1.5}, …]
})();





 
// A simple pid lookup
// psNode.lookup({
//     command: 'mongod',
//     psargs: '-l',
//     ppid: 6634
//     }, (err, resultList ) => {
//     if (err) {
//         throw new Error( err );
//     }
 
//     resultList.forEach(( process )=> {
//         if( process ){
//             console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
//         }
//     });
// });








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

