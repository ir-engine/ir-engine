import { Server, Socket } from 'socket.io';
import logger from '../app/logger';
import app from '../app';
// Map of Rooms for each party
const parties = new Map<string, Set<string>>();

// Map of participants that have joined parties
const peers = new Map<string, Set<string>>();

// UserIds
const userIds = new Map<string, Set<string>>();

function joinParty (socket: Socket, userId: string, partyId: string, response?: (param: any) => void): Promise<{ message: string}> {
  let peer = peers.get(socket.id);
  if (peer?.has(partyId)) {
    return Promise.reject(new Error('You are already in party!'));
  } else if (!peer) {
    peer = new Set<string>();
  }
  peer.add(partyId);
  peers.set(socket.id, peer);
  let party = parties.get(partyId);
  if (!party) {
    party = new Set<string>();
  }
  // Keep track of parties containing users
  party.add(socket.id);
  parties.set(partyId, party);
  socket.join(partyId);
  return Promise.resolve({
    message: `Joined party, id: ${String(partyId)}`
  });
}

export default (io: Server): void => {
  // logger.info('Socket-param', io)
  io.on('connection', (socket) => {
    logger.info('Connected to socket, id ' + String(socket.id));
    const userParties = socket.handshake.query.parties || [];
    const userId = socket.handshake.query.userId;
    if (userId) {
      userParties.forEach((partyId) => {
        let party = parties.get(partyId);
        if (!party) {
          party = new Set<string>();
        }
        party.add(socket.id);
        parties.set(partyId, party);
        socket.join(partyId);
      });
    }
    socket.on('request-socket-id', (response) => {
      response({ id: socket.id });
    });
    socket.on('disconnect', () => {
      logger.info('client disconnected, id ' + String(socket.id));
      const peerParties = peers.get(socket.id);
      if (!peerParties) {
        return;
      }
      peerParties.forEach((partyId: string) => {
        let partyPeers = parties.get(partyId);
        if (partyPeers !== undefined) {
          partyPeers = new Set(Array(...partyPeers).filter(id => id !== socket.id));
          parties.set(partyId, partyPeers);
          socket
            .in(partyId)
            .emit('user-disconnect', { id: userIds.get(socket.id) });
        }
      });
      userIds.delete(socket.id);
      peers.delete(socket.id);
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    socket.on('party-init', async ({ userId }, response) => { // Create Socket Rooms for parties that user has joined
      try {
        // eslint-disable-next-line @typescript-eslint/camelcase
        const { party_user } = app.get('sequelizeClient').models;
        const parties = await party_user.findAll({
          attributes: ['partyId'],
          where: {
            userId
          }
        });
        userIds.set(socket.id, userId);
        // logger.info("User's Parties: " + parties)
        parties.forEach(async ({ partyId }) => {
          try {
            await joinParty(socket, userId, partyId);
          } catch (e) {
            logger.error('User Party Init ERROR: ' + e.message);
          }
        });
        response({
          message: 'Parties joined successfully',
          parties
        });
      } catch (e) {
        response(new Error('Failed to join parties'));
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    socket.on('join-party', async ({ userId, partyId }, response) => {
      let message = '';
      try {
        message = (await joinParty(socket, userId, partyId, response)).message;
        userIds.set(socket.id, userId);
      } catch (e) {
        message = e.message;
      }
      response({ message });
    });

    socket.on('message-party-request', ({ userId, partyId, message }) => {
      if (!parties.get(partyId) || !parties.get(partyId).has(socket.id)) {
        return;
      }
      // logger.info('Party Users: ' + parties.get(partyId))
      // logger.info('User Joined parties: ' + peers.get(userId))
      // logger.info(
      //   `Message request from: user - ${userId}, in party: ${partyId} and message: ${message}`
      // )
      socket.in(partyId).emit('message-party', { message, user: userId });
    });
  });
};
