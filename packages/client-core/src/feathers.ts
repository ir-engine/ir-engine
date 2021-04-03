import io from 'socket.io-client';
import getConfig from 'next/config';
import feathers from '@feathersjs/client';

const { publicRuntimeConfig } = getConfig();
const apiServer = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.apiServer : 'https://127.0.0.1:3030';

const featherStoreKey: string = publicRuntimeConfig.featherStoreKey;

// Socket.io is exposed as the `io` global.

// @feathersjs/client is exposed as the `feathers` global.
  // @ts-ignore
export const client: any = !publicRuntimeConfig.offlineMode ? feathers() : undefined;
if(!publicRuntimeConfig.offlineMode) {
  const socket = io(apiServer);
  // @ts-ignore
  client.configure(feathers.socketio(socket, { timeout: 10000 }));
  // @ts-ignore
  client.configure(feathers.authentication({
    storageKey: featherStoreKey
  }));
}
