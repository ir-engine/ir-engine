import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import authentication from '@xrengine/server-core/src/user/authentication';
import channels from './channels';
import compress from 'compression';
import cors from 'cors';
import { EventEmitter } from 'events';
import feathersLogger from 'feathers-logger';
import swagger from 'feathers-swagger';
import sync from 'feathers-sync';
import fs from 'fs';
import helmet from 'helmet';
import { api } from '@xrengine/server-core/src/k8s';
import path from 'path';
import favicon from 'serve-favicon';
import winston from 'winston';
import config from '@xrengine/server-core/src/appconfig';
import { Application } from '@xrengine/server-core/declarations';
import logger from '@xrengine/server-core/src/logger';
import sequelize from '@xrengine/server-core/src/sequelize';
import services from '@xrengine/server-core/src/services';

const emitter = new EventEmitter();

const app = express(feathers()) as Application;

app.set('nextReadyEmitter', emitter);

if (config.server.enabled) {
  try {
    app.configure(
        swagger({
          docsPath: '/openapi',
          docsJsonPath: '/openapi.json',
          uiIndex: path.join(process.cwd() + '/openapi.html'),
          // TODO: Relate to server config, don't hardcode this here
          specs: {
            info: {
              title: 'XREngine API Surface',
              description: 'APIs for the XREngine application',
              version: '1.0.0'
            },
            schemes:['https'],
            securityDefinitions: {
              bearer: {
                type: 'apiKey',
                in: 'header',
                name: 'authorization'
              }
            },
            security: [
              { bearer: [] }
            ],
          }
        })
    );
    

    app.set('paginate', config.server.paginate);
    app.set('authentication', config.authentication);

    app.configure(sequelize);

    // Enable security, CORS, compression, favicon and body parsing
    app.use(helmet());
    app.use(cors(
        {
          origin: true,
          credentials: true
        }
    ));
    app.use(compress());
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(favicon(path.join(config.server.publicDir, 'favicon.ico')));

    // Set up Plugins and providers
    app.configure(express.rest());
    app.configure(socketio({
      serveClient: false,
      handlePreflightRequest: (req: any, res: any) => {
        // Set CORS headers
        if (res != null) {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
          res.setHeader('Access-Control-Request-Method', '*');
          res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET`');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.writeHead(200);
          res.end();
        }
      }
    }, (io) => {
      io.use((socket, next) => {
        (socket as any).feathers.socketQuery = socket.handshake.query;
        (socket as any).socketQuery = socket.handshake.query;
        next();
      });
    }));

    if (config.redis.enabled) {
      app.configure(sync({
        uri: config.redis.password != null ? `redis://${config.redis.address}:${config.redis.port}?password=${config.redis.password}` : `redis://${config.redis.address}:${config.redis.port}`
      }));

      (app as any).sync.ready.then(() => {
        logger.info('Feathers-sync started');
      });
    }

    app.configure(authentication);
    // Set up our services (see `services/index.js`)

    app.configure(feathersLogger(winston));

    app.configure(services);
    // Set up event channels (see channels.js)
    app.configure(channels);

    if (config.server.mode === 'api' || config.server.mode === 'realtime') {
      (app as any).k8AgonesClient = api({
        endpoint: `https://${config.kubernetes.serviceHost}:${config.kubernetes.tcpPort}`,
        version: '/apis/agones.dev/v1',
        auth: {
          caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
          token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
        }
      });
      (app as any).k8DefaultClient = api({
        endpoint: `https://${config.kubernetes.serviceHost}:${config.kubernetes.tcpPort}`,
        version: '/api/v1',
        auth: {
          caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
          token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
        }
      });
    }

    app.use('/healthcheck', (req, res) => {
      res.sendStatus(200);
    });
  } catch(err) {
    console.log('Server init failure');
    console.log(err);
  }
}

app.use(express.errorHandler({ logger } as any));

process.on('exit', async () => {
  console.log('Server EXIT');
});

process.on('SIGTERM', async (err) => {
  console.log('Server SIGTERM');
  console.log(err);
});
process.on('SIGINT', () => {
  console.log('RECEIVED SIGINT');
  process.exit();
});

//emitted when an uncaught JavaScript exception bubbles
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err);
  process.exit();
});

//emitted whenever a Promise is rejected and no error handler is attached to it
process.on('unhandledRejection', (reason, p) => {
  console.log('UNHANDLED REJECTION');
  console.log(reason);
  console.log(p);
  process.exit();
});

export default app;
