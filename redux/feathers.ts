import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { apiServer } from '../config/server';

// Socket.io is exposed as the `io` global.
const socket = io(apiServer);
// @feathersjs/client is exposed as the `feathers` global.
export const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(feathers.authentication({
    storageKey: 'auth-123'
}));
