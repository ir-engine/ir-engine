import fs from 'fs';
import path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import swagger from 'feathers-swagger';
import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import AgonesSDK from '@google-cloud/agones-sdk';

import { Application } from './declarations';
import logger from './app/logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app/app.hooks';
import channels from './app/channels';
import authentication from './app/authentication';
import sequelize from './app/sequelize';
import config from './config';
import sync from 'feathers-sync';
import K8s from 'k8s';

import { WebRTCGameServer } from "./gameserver/WebRTCGameServer";

import winston from 'winston';
import feathersLogger from 'feathers-logger';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

// Don't remove this comment. It's needed to format import lines nicely.

const app = express(feathers()) as Application;
const agonesSDK = new AgonesSDK();

function healthPing(agonesSDK: AgonesSDK): void {
  try {
    agonesSDK.health();
    setTimeout(() => healthPing(agonesSDK), 1000);
  } catch(err) {
    console.log('Agones healthping error');
    console.log(err);
  }
}

app.set('nextReadyEmitter', emitter);

if (config.server.enabled) {
  try {
    console.log('Server is enabled, setting up app');
    app.configure(
        swagger({
          docsPath: '/openapi',
          docsJsonPath: '/openapi.json',
          uiIndex: path.join(__dirname, '../openapi.html'),
          // TODO: Relate to server config, don't hardcode this here
          specs: {
            info: {
              title: 'XR3ngine API Surface',
              description: 'APIs for the XR3ngine application',
              version: '1.0.0'
            }
          }
        })
    );

    console.log('Swagger configured');
    app.set('paginate', config.server.paginate);
    app.set('authentication', config.authentication);

    app.configure(sequelize);
    console.log('Sequelize configured');

    // Enable security, CORS, compression, favicon and body parsing
    app.use(helmet());
    console.log('App using helmet');
    app.use(cors(
        {
          origin: true,
          credentials: true
        }
    ));
    console.log('CORS configured');
    app.use(compress());
    console.log('Compress configured');
    app.use(express.json());
    console.log('Express.json configured');
    app.use(express.urlencoded({extended: true}));
    console.log('Express.urlencoded configured');
    app.use(favicon(path.join(config.server.publicDir, 'favicon.ico')));
    console.log('Favicon configured');

    // Set up Plugins and providers
    app.configure(express.rest());
    console.log('Express.rest configured');
    app.configure(socketio({
      serveClient: false, handlePreflightRequest: (server, req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET`');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.writeHead(200);
        res.end();
      }
    }, (io) => {
      io.use((socket, next) => {
        (socket as any).feathers.socketQuery = socket.handshake.query;
        (socket as any).socketQuery = socket.handshake.query;
        next();
      });
    }));

    console.log('Socketio configured');
    if (config.redis.enabled) {
      app.configure(sync({
        uri: config.redis.password != null ? `redis://${config.redis.address}:${config.redis.port}?password=${config.redis.password}` : `redis://${config.redis.address}:${config.redis.port}`
      }));

      (app as any).sync.ready.then(() => {
        logger.info('Feathers-sync started');
      });
    }
    console.log('Redis configured');

    // Configure other middleware (see `middleware/index.js`)
    app.configure(middleware);
    console.log('Middleware configured');
    app.configure(authentication);
    console.log('Authentication configured');
    // Set up our services (see `services/index.js`)

    app.configure(feathersLogger(winston));
    console.log('Winston featherLogger configured');

    app.configure(services);
    console.log('Services configured');
    // Set up event channels (see channels.js)
    app.configure(channels);
    console.log('Channels configured');

    // Host the public folder
    // Configure a middleware for 404s and the error handler

    // Host the public folder
    // Configure a middleware for 404s and the error handler

    app.hooks(appHooks);
    console.log('appHooks configured');

    if (config.server.mode === 'api' || config.server.mode === 'realtime') {
      (app as any).k8AgonesClient = K8s.api({
        endpoint: `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_PORT_443_TCP_PORT}`,
        version: '/apis/agones.dev/v1',
        auth: {
          caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
          token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
        }
      });
      console.log('K8s Agones client configured');
      (app as any).k8DefaultClient = K8s.api({
        endpoint: `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_PORT_443_TCP_PORT}`,
        version: '/api/v1',
        auth: {
          caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
          token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
        }
      });
      console.log('K8s default client configured');
    }

    if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || process.env.NODE_ENV === 'development' || config.server.mode === 'local') {
      agonesSDK.connect();
      agonesSDK.ready();
      (app as any).agonesSDK = agonesSDK;
      healthPing(agonesSDK);
      console.log('Agones SDK set up and pinging');

      // Create new gameserver instance
      const gameServer = new WebRTCGameServer(app);
      console.log('Gameserver created');
      logger.info("Created new gameserver instance");
    } else {
      console.warn('Did not create gameserver');
    }

    app.use('/healthcheck', (req, res) => {
      res.sendStatus(200);
    });
    console.log('App setup done');
  } catch(err) {
    console.log('Server init failure');
    console.log(err);
  }
}

app.use(express.errorHandler({ logger } as any));
console.log('express errorHandler configured');

const editorPath = process.env.NODE_ENV === 'production' ? path.join(config.server.nodeModulesDir, '/xr3-editor/dist') : path.join(config.server.rootDir, '/node_modules/xr3-editor/dist');
app.use(express.static(editorPath));
app.all('/editor/*', (req, res) => res.sendFile(path.join(editorPath, 'editor/index.html')));
console.log('Editor redirects configured');

process.on('exit', async () => {
  console.log('Server EXIT');
  // if ((app as any).gsSubdomainNumber != null) {
  //   const gsSubdomainProvision = await app.service('gameserver-subdomain-provision').find({
  //     query: {
  //       gs_number: (app as any).gsSubdomainNumber
  //     }
  //   });
  //   await app.service('gameserver-subdomain-provision').patch(gsSubdomainProvision.data[0].id, {
  //     allocated: false
  //   });
  // }
});

process.on('SIGTERM', async (err) => {
  console.log('Server SIGTERM');
  console.log(err);
  // const gsName = (app as any).gsName;
  // if ((app as any).gsSubdomainNumber != null) {
  //   const gsSubdomainProvision = await app.service('gameserver-subdomain-provision').find({
  //     query: {
  //       gs_number: (app as any).gsSubdomainNumber
  //     }
  //   });
  //   await app.service('gameserver-subdomain-provision').patch(gsSubdomainProvision.data[0].id, {
  //     allocated: false
  //   });
  // }
});
export default app;
