import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, removeEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { MessageTypes } from '@xr3ngine/engine/src/networking/enums/MessageTypes';
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { DataConsumer, DataProducer } from 'mediasoup/lib/types';
import logger from "../../app/logger";
import config from '../../config';
import { closeTransport } from './WebRTCFunctions';

export async function getFreeSubdomain(gsIdentifier: string, subdomainNumber: number): Promise<string> {
    const transport = Network.instance.transport as any;
    const stringSubdomainNumber = subdomainNumber.toString().padStart(config.gameserver.identifierDigits, '0');
    const subdomainResult = await transport.app.service('gameserver-subdomain-provision').find({
        query: {
            gs_number: stringSubdomainNumber
        }
    });
    if ((subdomainResult as any).total === 0) {
        await transport.app.service('gameserver-subdomain-provision').create({
            allocated: true,
            gs_number: stringSubdomainNumber,
            gs_id: gsIdentifier
        });

        return stringSubdomainNumber;
    } else {
        const subdomain = (subdomainResult as any).data[0];
        if (subdomain.allocated === true || subdomain.allocated === 1) {
            return getFreeSubdomain(gsIdentifier, subdomainNumber + 1);
        }
        await transport.app.service('gameserver-subdomain-provision').patch(subdomain.id, {
            allocated: true,
            gs_id: gsIdentifier
        });

        return stringSubdomainNumber;
    }
}

export function getUserIdFromSocketId(socketId): string | null {
    let userId;

    for (const key in Network.instance.clients)
        if (Network.instance.clients[key].socketId === socketId) {
            userId = Network.instance.clients[key].userId;
            break;
        }

    if (userId === undefined) return null;
    return userId;
}

export function validateNetworkObjects(): void {
    const transport = Network.instance.transport as any;
    for (const client in Network.instance.clients) {
        // Validate that user has phoned home in last 5 seconds
        if (Date.now() - Network.instance.clients[client].lastSeenTs > 5000) {
            logger.info("Removing client ", client, " due to activity");
            if (!Network.instance.clients[client])
                return console.warn('Client is not in client list');

            const disconnectedClient = Object.assign({}, Network.instance.clients[client]);

            Network.instance.worldState.clientsDisconnected.push({ client });
            logger.info('Disconnected Client:');
            logger.info(disconnectedClient);
            if (disconnectedClient?.instanceRecvTransport)
                disconnectedClient.instanceRecvTransport.close();
            if (disconnectedClient?.instanceSendTransport)
                disconnectedClient.instanceSendTransport.close();
            if (disconnectedClient?.partyRecvTransport)
                disconnectedClient.partyRecvTransport.close();
            if (disconnectedClient?.partySendTransport)
                disconnectedClient.partySendTransport.close();

            // Find all network objects that the disconnecting client owns and remove them
            const networkObjectsClientOwns = [];

            // Loop through network objects in world
            for (const obj in Network.instance.networkObjects)
                // If this client owns the object, add it to our array
                if (Network.instance.networkObjects[obj].ownerId === client)
                    networkObjectsClientOwns.push(Network.instance.networkObjects[obj]);

            // Remove all objects for disconnecting user
            networkObjectsClientOwns.forEach(obj => {
                // Get the entity attached to the NetworkObjectComponent and remove it
                logger.info("Removed entity ", (obj.component.entity as Entity).id, " for user ", client);
                const removeMessage = { networkId: obj.networkId };
                Network.instance.worldState.destroyObjects.push(removeMessage);
                // if (Network.instance.worldState.inputs[obj.networkId])
                delete Network.instance.worldState.inputs[obj.networkId];
                removeEntity(obj.component.entity);
            });

            if (Network.instance.clients[client])
                delete Network.instance.clients[client];
        }
    }
    Object.keys(Network.instance.networkObjects).forEach((key: string) => {
        const networkObject = Network.instance.networkObjects[key];
        // Validate that the object has an associated user and doesn't belong to a non-existant user
        if (networkObject.ownerId !== undefined && Network.instance.clients[networkObject.ownerId] !== undefined)
            return;

        // If it does, tell clients to destroy it
        const removeMessage = { networkId: networkObject.component.networkId };
        Network.instance.worldState.destroyObjects.push(removeMessage);
        logger.info("Culling ownerless object: ", networkObject.component.networkId, "owned by ", networkObject.ownerId);

        // get network object
        const entity = networkObject.component.entity;

        // Remove the entity and all of it's components
        removeEntity(entity);

        // Remove network object from list
        delete Network.instance.networkObjects[key];
        logger.info(key, " removed from simulation");
    });
}


export async function handleJoinWorld(socket, data, callback, userId, user) {
    logger.info("JoinWorld received");
    const transport = Network.instance.transport as any;
    // If we are already logged in, kick the other socket
    if (Network.instance.clients[userId] !== undefined &&
        Network.instance.clients[userId].socketId !== socket.id) {
        logger.info("Client already exists, kicking the old client and disconnecting");
        Network.instance.clients[userId].socket.emit(MessageTypes.Kick.toString());
        Network.instance.clients[userId].socket.disconnect();
    }

    Object.keys(Network.instance.networkObjects).forEach((key: string) => {
        const networkObject = Network.instance.networkObjects[key];
        // Validate that the object belonged to disconnecting user
        if (networkObject.ownerId !== userId) return;

        // If it does, tell clients to destroy it
        Network.instance.worldState.destroyObjects.push({ networkId: networkObject.component.networkId });

        // get network object
        const entity = Network.instance.networkObjects[key].component.entity;

        // Remove the entity and all of it's components
        removeEntity(entity);

        // Remove network object from list
        delete Network.instance.networkObjects[key];
    });

    // Create a new client objectr
    const newClient = {
        userId: userId,
        name: user.dataValues.name,
        socket: socket,
        socketId: socket.id,
        lastSeenTs: Date.now(),
        joinTs: Date.now(),
        media: {},
        consumerLayers: {},
        stats: {},
        dataConsumers: new Map<string, DataConsumer>(), // Key => id of data producer
        dataProducers: new Map<string, DataProducer>() // Key => label of data channel
    };

    // Add to the dictionary
    Network.instance.clients[userId] = newClient;

    Network.instance.worldState.clientsConnected.push({ userId });

    // Create a new default prefab for client
    const networkObject = initializeNetworkObject(userId, Network.getNetworkId(), Network.instance.schema.defaultClientPrefab);
    const transform = getComponent(networkObject.entity, TransformComponent);

    // Add the network object to our list of network objects
    Network.instance.networkObjects[networkObject.networkId] = {
        ownerId: userId, // Owner's socket ID
        prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
        component: networkObject
    };

    // Added new object to the worldState with networkId and ownerId
    Network.instance.worldState.createObjects.push({
        networkId: networkObject.networkId,
        ownerId: userId,
        prefabType: Network.instance.schema.defaultClientPrefab,
        x: transform.position.x,
        y: transform.position.y,
        z: transform.position.z,
        qX: transform.rotation.x,
        qY: transform.rotation.y,
        qZ: transform.rotation.z,
        qW: transform.rotation.w
    });

    // Create a new worldtate object that we can fill
    const worldState = {
        tick: Network.tick,
        transforms: [],
        inputs: [],
        clientsConnected: [],
        clientsDisconnected: [],
        createObjects: [],
        destroyObjects: []
    };

    // Get all clients and add to clientsConnected and push to world state frame
    for (const userId in Network.instance.clients)
        worldState.clientsConnected.push({ userId: Network.instance.clients[userId].userId });

    // Get all network objects and add to createObjects
    for (const networkId in Network.instance.networkObjects) {
        const transform = getComponent(Network.instance.networkObjects[networkId].component.entity, TransformComponent);
        worldState.createObjects.push({
            prefabType: Network.instance.networkObjects[networkId].prefabType,
            networkId: networkId,
            ownerId: Network.instance.networkObjects[networkId].ownerId,
            x: transform.position.x,
            y: transform.position.y,
            z: transform.position.z,
            qX: transform.rotation.x,
            qY: transform.rotation.y,
            qZ: transform.rotation.z,
            qW: transform.rotation.w
        });
    }

    // Return initial world state to client to set things up
    callback({
        worldState /* worldState: worldStateModel.toBuffer(worldState) */,
        routerRtpCapabilities: transport.routers.instance.rtpCapabilities
    });
}

export async function handleIncomingMessage(socket, message) {
    Network.instance.incomingMessageQueue.add(message);
}

export async function handleHeartbeat(socket) {
    const userId = getUserIdFromSocketId(socket.id);
    if (Network.instance.clients[userId] != undefined)
        Network.instance.clients[userId].lastSeenTs = Date.now();
}

export async function handleDisconnect(socket) {
    const userId = getUserIdFromSocketId(socket.id);
    const disconnectedClient = Network.instance.clients[userId];
    if (disconnectedClient === undefined)
        return console.warn("Disconnecting client was undefined, probably already handled from JoinWorld handshake");
    //On local, new connections can come in before the old sockets are disconnected.
    //The new connection will overwrite the socketID for the user's client.
    //This will only clear transports if the client's socketId matches the socket that's disconnecting.
    if (socket.id === disconnectedClient?.socketId) {

        Object.keys(Network.instance.networkObjects).forEach((key: string) => {
            const networkObject = Network.instance.networkObjects[key];
            // Validate that the object belonged to disconnecting user
            if (networkObject.ownerId !== userId) return;

            logger.info("Culling object:", networkObject.component.networkId, "owned by disconnecting client", networkObject.ownerId);

            // If it does, tell clients to destroy it
            Network.instance.worldState.destroyObjects.push({ networkId: networkObject.component.networkId });

            // get network object
            const entity = Network.instance.networkObjects[key].component.entity;

            // Remove the entity and all of it's components
            removeEntity(entity);

            // Remove network object from list
            delete Network.instance.networkObjects[key];
        });


        Network.instance.worldState.clientsDisconnected.push({ userId });
        logger.info('Disconnecting clients for user ' + userId);
        if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close();
        if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close();
        if (disconnectedClient?.partyRecvTransport) disconnectedClient.partyRecvTransport.close();
        if (disconnectedClient?.partySendTransport) disconnectedClient.partySendTransport.close();
        if (Network.instance.clients[userId] !== undefined)
            delete Network.instance.clients[userId];
    } else {
        console.warn("Socket didn't match for disconnecting client");
    }
}

export async function handleLeaveWorld(socket, data, callback) {
    const userId = getUserIdFromSocketId(socket.id);
    if (MediaStreamComponent.instance.transports)
        for (const [, transport] of Object.entries(MediaStreamComponent.instance.transports))
            if ((transport as any).appData.peerId === userId)
                closeTransport(transport);
    if (Network.instance.clients[userId] !== undefined)
        delete Network.instance.clients[userId];
    logger.info("Removing " + userId + " from client list");
    if (callback !== undefined) callback({});
}
