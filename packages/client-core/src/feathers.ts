import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { Config } from './helper';

const apiServer = process.env.NODE_ENV === 'production' ? Config.publicRuntimeConfig.apiServer : 'https://127.0.0.1:3030';

const featherStoreKey: string = Config.publicRuntimeConfig.featherStoreKey;

// Socket.io is exposed as the `io` global.

// @feathersjs/client is exposed as the `feathers` global.
  // @ts-ignore
export const client: any = !Config.publicRuntimeConfig.offlineMode ? feathers() : undefined;
if(!Config.publicRuntimeConfig.offlineMode) {
  const socket = io(apiServer);
  // @ts-ignore
  client.configure(feathers.socketio(socket, { timeout: 10000 }));
  // @ts-ignore
  client.configure(feathers.authentication({
    storageKey: featherStoreKey
  }));
}
