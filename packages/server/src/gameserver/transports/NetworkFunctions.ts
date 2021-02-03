import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, removeEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import { Network } from "@xr3ngine/engine/src/networking//classes/Network";
import { MessageTypes } from '@xr3ngine/engine/src/networking/enums/MessageTypes';
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { DataConsumer, DataProducer } from 'mediasoup/lib/types';
import logger from "../../app/logger";
import config from '../../config';
import { closeTransport } from './WebRTCFunctions';
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/;

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

        await new Promise(resolve => setTimeout(async () => { resolve();}, 500));

        const newSubdomainResult = await transport.app.service('gameserver-subdomain-provision').find({
            query: {
                gs_number: stringSubdomainNumber
            }
        });
        if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === gsIdentifier) return stringSubdomainNumber;
        else return getFreeSubdomain(gsIdentifier, subdomainNumber + 1);
    } else {
        const subdomain = (subdomainResult as any).data[0];
        if (subdomain.allocated === true || subdomain.allocated === 1) {
            return getFreeSubdomain(gsIdentifier, subdomainNumber + 1);
        }
        await transport.app.service('gameserver-subdomain-provision').patch(subdomain.id, {
            allocated: true,
            gs_id: gsIdentifier
        });

        await new Promise(resolve => setTimeout(async () => { resolve();}, 500));

        const newSubdomainResult = await transport.app.service('gameserver-subdomain-provision').find({
            query: {
                gs_number: stringSubdomainNumber
            }
        });
        if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === gsIdentifier) return stringSubdomainNumber;
        else return getFreeSubdomain(gsIdentifier, subdomainNumber + 1);
    }
}

export async function cleanupOldGameservers(): Promise<void> {
    const transport = Network.instance.transport as any;
    const instances = await transport.app.service('instance').Model.findAndCountAll({
        offset: 0,
        limit: 1000
    });
    const gameservers = await (transport.app as any).k8AgonesClient.get('gameservers');
    const gsIds = gameservers.items.map(gs => gsNameRegex.exec(gs.metadata.name) != null ? gsNameRegex.exec(gs.metadata.name)[1] : null);

    await Promise.all(instances.rows.map(instance => {
        const [ip, port] = instance.ipAddress.split(':');
        const match = gameservers.items.find(gs => {
            const inputPort = gs.status.ports.find(port => port.name === 'default');
            return gs.status.address === ip && inputPort.port.toString() === port;
        });
        return match == null ? transport.app.service('instance').remove(instance.id) : Promise.resolve();
    }));

    await transport.app.service('gameserver-subdomain-provision').patch(null, {
        allocated: false
    }, {
        query: {
            instanceId: null,
            gs_id: {
                $nin: gsIds
            }
        }
    });

    return;
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
    for (const userId in Network.instance.clients) {
        // Validate that user has phoned home in last 5 seconds
        if (Date.now() - Network.instance.clients[userId].lastSeenTs > 30000) {
            console.log("Removing client ", userId, " due to inactivity");
            if (!Network.instance.clients[userId])
                return console.warn('Client is not in client list');

            const disconnectedClient = Object.assign({}, Network.instance.clients[userId]);

            Network.instance.clientsDisconnected.push({ userId });
            console.log('Disconnected Client:');
            console.log(disconnectedClient);
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
                if (Network.instance.networkObjects[obj].ownerId === userId)
                    networkObjectsClientOwns.push(Network.instance.networkObjects[obj]);

            // Remove all objects for disconnecting user
            networkObjectsClientOwns.forEach(obj => {
                // Get the entity attached to the NetworkObjectComponent and remove it
                logger.info("Removed entity ", (obj.component.entity as Entity).id, " for user ", userId);
                const removeMessage = { networkId: obj.component.networkId };
                Network.instance.destroyObjects.push(removeMessage);
                // if (Network.instance.worldState.inputs[obj.networkId])
                removeEntity(obj.component.entity);
                delete Network.instance.networkObjects[obj.id];
                delete Network.instance.worldState.inputs[obj.networkId];
            });

            if (Network.instance.clients[userId])
                delete Network.instance.clients[userId];
        }
    }
    Object.keys(Network.instance.networkObjects).forEach((key: string) => {
        const networkObject = Network.instance.networkObjects[key];
        // Validate that the object has an associated user and doesn't belong to a non-existant user
        if (networkObject.ownerId !== undefined && Network.instance.clients[networkObject.ownerId] !== undefined || networkObject.ownerId === "server")
            return;

        logger.info("Culling ownerless object: ", networkObject.component.networkId, "owned by ", networkObject.ownerId);

        // If it does, tell clients to destroy it
        const removeMessage = { networkId: networkObject.component.networkId };
        Network.instance.destroyObjects.push(removeMessage);

        // get network object
        const entity = networkObject.component.entity;

        // Remove the entity and all of it's components
        removeEntity(entity);

        // Remove network object from list
        delete Network.instance.networkObjects[key];
        logger.info(key, " removed from simulation");
    });
}


export async function handleConnectToWorld(socket, data, callback, userId, user): Promise<any> {
    const transport = Network.instance.transport as any;

    console.log('Connect to world from ' + userId);
    disconnectClientIfConnected(socket, userId);

    // Create a new client object
    // and add to the dictionary
    Network.instance.clients[userId] = {
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

    // Push to our worldstate to send out to other users
    Network.instance.clientsConnected.push({ userId, name: userId });

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
    Object.keys(Network.instance.clients).forEach(userId => {
        worldState.clientsConnected.push({ userId: Network.instance.clients[userId].userId, name: Network.instance.clients[userId].userId });
    });

    // Return initial world state to client to set things up
    callback({
        worldState /* worldState: worldStateModel.toBuffer(worldState) */,
        routerRtpCapabilities: transport.routers.instance.rtpCapabilities
    });
}

function disconnectClientIfConnected(socket, userId: string): void {
    // If we are already logged in, kick the other socket
    if (Network.instance.clients[userId] !== undefined &&
      Network.instance.clients[userId].socketId !== socket.id) {
        logger.info("Client already exists, kicking the old client and disconnecting");
        Network.instance.clients[userId].socket.emit(MessageTypes.Kick.toString());
        Network.instance.clients[userId].socket.disconnect();
    }

    console.log(Network.instance.networkObjects);
    Object.keys(Network.instance.networkObjects).forEach((key: string) => {
        const networkObject = Network.instance.networkObjects[key];
        // Validate that the object belonged to disconnecting user
        if (networkObject.ownerId !== userId) return;

        // If it does, tell clients to destroy it
        console.log('destroyObjects.push({ networkId: networkObject.component.networkId', networkObject.component.networkId);
        if (typeof networkObject.component.networkId === "number") {
            Network.instance.destroyObjects.push({ networkId: networkObject.component.networkId });
        } else {
            console.error('networkObject.component.networkId is invalid', networkObject);
            logger.error('networkObject.component.networkId is invalid');
            logger.error(networkObject);
        }

        // get network object
        const entity = Network.instance.networkObjects[key].component.entity;

        // Remove the entity and all of it's components
        removeEntity(entity);

        // Remove network object from list
        delete Network.instance.networkObjects[key];
    });
}

export async function handleJoinWorld(socket, data, callback, userId, user): Promise<any> {
    logger.info("JoinWorld received");
    const transport = Network.instance.transport as any;

    const spawnPoint = Engine.spawnSystem.getRandomSpawnPoint();

    // Create a new default prefab for client
    const networkObject = initializeNetworkObject(userId, Network.getNetworkId(), Network.instance.schema.defaultClientPrefab, spawnPoint.position, spawnPoint.rotation);
    const transform = getComponent(networkObject.entity, TransformComponent);

    // Add the network object to our list of network objects
    Network.instance.networkObjects[networkObject.networkId] = {
        ownerId: userId, // Owner's socket ID
        prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
        component: networkObject,
        uniqueId: ''
    };

    // Added new object to the worldState with networkId and ownerId
    Network.instance.createObjects.push({
        networkId: networkObject.networkId,
        ownerId: userId,
        prefabType: Network.instance.schema.defaultClientPrefab,
        uniqueId: '',
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
    Object.keys(Network.instance.clients).forEach(userId => {
        worldState.clientsConnected.push({ userId: Network.instance.clients[userId].userId, name: Network.instance.clients[userId].userId });
    });

    // Get all network objects and add to createObjects
    Object.keys(Network.instance.networkObjects).forEach(networkId => {
        const transform = getComponent(Network.instance.networkObjects[networkId].component.entity, TransformComponent);
        worldState.createObjects.push({
            prefabType: Network.instance.networkObjects[networkId].prefabType,
            networkId: networkId,
            ownerId: Network.instance.networkObjects[networkId].ownerId,
            uniqueId: Network.instance.networkObjects[networkId].uniqueId ? Network.instance.networkObjects[networkId].uniqueId : '',
            x: transform.position.x,
            y: transform.position.y,
            z: transform.position.z,
            qX: transform.rotation.x,
            qY: transform.rotation.y,
            qZ: transform.rotation.z,
            qW: transform.rotation.w
        });
    });

    // Return initial world state to client to set things up
    callback({
        worldState /* worldState: worldStateModel.toBuffer(worldState) */,
        routerRtpCapabilities: transport.routers.instance.rtpCapabilities
    });
}

export async function handleIncomingMessage(socket, message): Promise<any> {
    Network.instance.incomingMessageQueue.add(message);
}

export async function handleHeartbeat(socket): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    // console.log('Got heartbeat from user ' + userId + ' at ' + Date.now());
    if (Network.instance.clients[userId] != undefined)
        Network.instance.clients[userId].lastSeenTs = Date.now();
}

export async function handleDisconnect(socket): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    const disconnectedClient = Network.instance.clients[userId];
    if (disconnectedClient === undefined)
        return console.warn('Disconnecting client ' + userId + ' was undefined, probably already handled from JoinWorld handshake');
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
            Network.instance.destroyObjects.push({ networkId: networkObject.component.networkId });

            // get network object
            const entity = Network.instance.networkObjects[key].component.entity;

            // Remove the entity and all of it's components
            removeEntity(entity);

            // Remove network object from list
            delete Network.instance.networkObjects[key];
        });


        Network.instance.clientsDisconnected.push({ userId });
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

export async function handleLeaveWorld(socket, data, callback): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    if (Network.instance.transports)
        for (const [, transport] of Object.entries(Network.instance.transports))
            if ((transport as any).appData.peerId === userId)
                closeTransport(transport);
    if (Network.instance.clients[userId] !== undefined)
        delete Network.instance.clients[userId];
    logger.info("Removing " + userId + " from client list");
    if (callback !== undefined) callback({});
}
