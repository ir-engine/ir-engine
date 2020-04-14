import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { apiServer, featherStoreKey } from '../config/server';

// Socket.io is exposed as the `io` global.
const socket = io(apiServer);
// @feathersjs/client is exposed as the `feathers` global.
export const client = feathers();

client.configure(feathers.socketio(socket, {timeout: 10000}));
client.configure(feathers.authentication({
    storageKey: featherStoreKey
}));
