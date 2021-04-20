import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { Config } from './helper';

console.log('publicRuntimeConfig:');
console.log(Config.publicRuntimeConfig);
const apiServer = Config.publicRuntimeConfig.apiServer ?? (process.env.NODE_ENV === 'production' ? null : 'https://127.0.0.1:3030');
console.log('apiServer:', apiServer);

const feathersStoreKey: string = Config.publicRuntimeConfig.feathersStoreKey;
const feathersClient: any = !Config.publicRuntimeConfig.offlineMode ? feathers() : undefined;
if(!Config.publicRuntimeConfig.offlineMode) {
  const socket = io(apiServer);
  feathersClient.configure(feathers.socketio(socket, { timeout: 10000 }));
  feathersClient.configure(feathers.authentication({
    storageKey: feathersStoreKey
  }));
}

console.log(feathersClient);

export const client = feathersClient;
