import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { Config } from './helper';

const apiServer = Config.publicRuntimeConfig.apiServer ?? (process.env.NODE_ENV === 'production' ? null : 'https://127.0.0.1:3030');

const feathersStoreKey: string = Config.publicRuntimeConfig.feathersStoreKey;
const feathersClient: any = !Config.publicRuntimeConfig.offlineMode ? feathers() : undefined;
if(!Config.publicRuntimeConfig.offlineMode) {
  const socket = io(apiServer);
  feathersClient.configure(feathers.socketio(socket, { timeout: 10000 }));
  feathersClient.configure(feathers.authentication({
    storageKey: feathersStoreKey
  }));
}

export const client = feathersClient;
