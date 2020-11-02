import isNullOrUndefined from '@xr3ngine/engine/src/common/functions/isNullOrUndefined';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, removeEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { initializeNetworkObject } from "@xr3ngine/engine/src/networking/functions/initializeNetworkObject";
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import {
    CreateWebRtcTransportParams,
    UnreliableMessageReturn
} from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import AWS from 'aws-sdk';
import * as https from "https";
import { createWorker } from 'mediasoup';
import { types as MediaSoupClientTypes } from "mediasoup-client";
import { SctpParameters } from "mediasoup-client/lib/SctpParameters";
import {
    DataConsumer,
    DataProducer,
    DataProducerOptions,
    Producer,
    Router,
    RtpCodecCapability,
    Transport,
    WebRtcTransport,
    Worker
} from "mediasoup/lib/types";
import SocketIO, { Socket } from "socket.io";
import logger from "../../app/logger";
import config from '../../config';
import getLocalServerIp from '../../util/get-local-server-ip';

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/;
const Route53 = new AWS.Route53({ ...config.aws.route53.keys });

interface Client {
    socket: SocketIO.Socket;
    lastSeenTs: number;
    joinTs: number;
    media: any;
    consumerLayers: any;
    stats: any;
}

interface RtcPortRange {
    startPort: number;
    endPort: number;
}

const localConfig = {
    httpPeerStale: 15000,
    mediasoup: {
        worker: {
            rtcMinPort: config.gameserver.rtc_start_port,
            rtcMaxPort: config.gameserver.rtc_end_port,
            logLevel: "info",
            logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"]
        },
        router: {
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 90000,
                    parameters: {
                        //                'x-google-start-bitrate': 1000
                    }
                },
                {
                    kind: "video",
                    mimeType: "video/h264",
                    clockRate: 90000,
                    parameters: {
                        "packetization-mode": 1,
                        "profile-level-id": "4d0032",
                        "level-asymmetry-allowed": 1
                    }
                },
                {
                    kind: "video",
                    mimeType: "video/h264",
                    clockRate: 90000,
                    parameters: {
                        "packetization-mode": 1,
                        "profile-level-id": "42e01f",
                        "level-asymmetry-allowed": 1
                    }
                }
            ]
        },

        // rtp listenIps are the most important thing, below. you'll need
        // to set these appropriately for your network for the demo to
        // run anywhere but on localhost
        webRtcTransport: {
            listenIps: [{ ip: "192.168.0.81", announcedIp: null }],
            initialAvailableOutgoingBitrate: 800000,
            maxIncomingBitrate: 150000
        }
    }
};

const defaultRoomState = {
    // external
    activeSpeaker: { producerId: null, volume: null, peerId: null },
    // internal
    transports: {},
    producers: [],
    consumers: [],
    peers: {}
    // These are now kept for each individual client (in peers object)
    // dataProducers: [] as DataProducer[],
    // dataConsumers: [] as DataConsumer[]
};

const sctpParameters: SctpParameters = {
    OS: 1024,
    MIS: 65535,
    maxMessageSize: 65535,
    port: 5000
};

export class SocketWebRTCServerTransport implements NetworkTransport {
    isServer = true
    server: https.Server
    socketIO: SocketIO.Server
    worker: Worker
    routers: Record<string, Router>
    transport: Transport
    isInitialized = false
    app: any

    constructor(app) {
        this.app = app;
    }

    sendReliableData(message: any): void {
        if (this.socketIO != null) this.socketIO.of('/realtime').emit(MessageTypes.ReliableMessage.toString(), message);
    }

    async sendData(data: any, channel = 'default'): Promise<UnreliableMessageReturn> {
        try {
            return await this.transport.produceData({
                appData: { data },
                sctpStreamParameters: data.sctpStreamParameters,
                label: channel,
                protocol: 'raw'
            });
        } catch (error) {
            logger.error(error);
        }
    }

    handleKick(socket: any) {
        console.log("Kicking ", socket.id);
        console.log(this.socketIO.sockets.connected[socket.id])
        if (this.socketIO != null) this.socketIO.of('/realtime').emit(MessageTypes.Kick.toString(), socket.id);
    }

    async getFreeSubdomain(gsIdentifier: string, subdomainNumber: number): Promise<string> {
        try {
            const stringSubdomainNumber = subdomainNumber.toString().padStart(config.gameserver.identifierDigits, '0');
            const subdomainResult = await this.app.service('gameserver-subdomain-provision').find({
                query: {
                    gs_number: stringSubdomainNumber
                }
            });
            if ((subdomainResult as any).total === 0) {
                await this.app.service('gameserver-subdomain-provision').create({
                    allocated: true,
                    gs_number: stringSubdomainNumber,
                    gs_id: gsIdentifier
                });

                return stringSubdomainNumber;
            } else {
                const subdomain = (subdomainResult as any).data[0];
                if (subdomain.allocated === true || subdomain.allocated === 1) {
                    return this.getFreeSubdomain(gsIdentifier, subdomainNumber + 1);
                }
                await this.app.service('gameserver-subdomain-provision').patch(subdomain.id, {
                    allocated: true,
                    gs_id: gsIdentifier
                });

                return stringSubdomainNumber;
            }
        } catch (err) {
            logger.error('get RTC port range error');
            logger.error(err);
        }
    }

    gameServer;

    public async initialize(address, port = 3030): Promise<void> {
        if (this.isInitialized) console.error("Already initialized transport");
        this.isInitialized = true;

        logger.info('Initializing server transport');

        let stringSubdomainNumber, gsResult;
        if (process.env.KUBERNETES === 'true') {
            this.gameServer = await (this.app as any).agonesSDK.getGameServer();
            const name = this.gameServer.objectMeta.name;
            (this.app as any).gsName = name;

            const gsIdentifier = gsNameRegex.exec(name);
            stringSubdomainNumber = await this.getFreeSubdomain(gsIdentifier[1], 0);
            (this.app as any).gsSubdomainNumber = stringSubdomainNumber;

            gsResult = await (this.app as any).agonesSDK.getGameServer();
            const params = {
                ChangeBatch: {
                    Changes: [
                        {
                            Action: 'UPSERT',
                            ResourceRecordSet: {
                                Name: `${stringSubdomainNumber}.${config.gameserver.domain}`,
                                ResourceRecords: [
                                    {
                                        Value: gsResult.status.address
                                    }
                                ],
                                TTL: 0,
                                Type: 'A'
                            }
                        }
                    ]
                },
                HostedZoneId: config.aws.route53.hostedZoneId
            };
            if (config.gameserver.local !== true) await Route53.changeResourceRecordSets(params).promise();
        }

        logger.info('Starting WebRTC');
        await this.startMediasoup();

        // Start Websockets
        logger.info("Starting websockets");
        const localIp = await getLocalServerIp();
        localConfig.mediasoup.webRtcTransport.listenIps = [{
            ip: '0.0.0.0',
            announcedIp: process.env.KUBERNETES === 'true' ? (config.gameserver.local === true ? gsResult.status.address : `${stringSubdomainNumber}.${config.gameserver.domain}`) : localIp.ipAddress
        }];

        setInterval(() => this.validateNetworkObjects(), 5000);

        // Set up realtime channel on socket.io
        this.socketIO = (this.app as any)?.io;
        const realtime = this.socketIO.of('/realtime');
        // On connection, set up a bunch of handlers in the connect function
        realtime.on("connect", (socket: Socket) => {
            console.log("Received connection request from ", socket.id);
            // Client sent connection request -- socket.io will respond with a connection success automatically
            // Client should then send an authorization offer, which we will validate before adding more socket events
            logger.info("Connected, waiting for authorization request");
            socket.on(MessageTypes.Authorization.toString(), async (data, callback) => {
                const userId = data.userId;
                const accessToken = data.accessToken;

                // userId or access token were undefined, so something is wrong. Return failure
                if (isNullOrUndefined(userId) || isNullOrUndefined(accessToken)) {
                    const message = "userId or accessToken is undefined";
                    console.error(message);
                    callback({ success: false, message });
                    return;
                }

                // Check database to verify that user ID is valid
                const user = await this.app.service('user').Model.findOne({
                    attributes: ['id', 'name', 'instanceId'],
                    where: {
                        id: userId
                    }
                }).catch(error => {
                    // They weren't found in the dabase, so send the client an error message and return
                    callback({ success: false, message: error });
                    return console.warn("Failed to authorize user");
                });


                // TODO: Check that we are supposed to be in this instance ID, etc.


                // We got through the validations, so return an authorization success messaage to client
                callback({ success: true });

                // Start listening for a JoinWorld message
                socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) => {
                    // If we are already logged in, kick the other socket
                    if (Network.instance.clients[userId] !== undefined &&
                        Network.instance.clients[userId].socketId !== socket.id) {
                        console.log("Client already exists, kicking the old client and disconnecting");
                        Network.instance.clients[userId].socket.emit(MessageTypes.Kick.toString());
                        Network.instance.clients[userId].socket.disconnect();
                    }

                    logger.info("JoinWorld received");
                    try {
                        // TODO: Refactor as maps
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
                        })
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

                        Network.instance.worldState.clientsConnected.push({ userId })


                        // If we have a a character already, use network id, otherwise create a new one
                        const networkId = Network.getNetworkId();

                        let networkObject = initializeNetworkObject(userId, networkId, Network.instance.schema.defaultClientPrefab);

                        // Add the network object to our list of network objects
                        Network.instance.networkObjects[networkId] = {
                            ownerId: userId, // Owner's socket ID
                            prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
                            component: networkObject
                        };

                        const transform = getComponent(networkObject.entity, TransformComponent);

                        console.log("Added new network object")
                        // Get a reference to the transform on the object so we can send initial values

                        // Added created to the worldState with networkId and ownerId
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

                        // Prepare a fresh worldstate for new client inintialization
                        const worldState = {
                            tick: Network.tick,
                            transforms: [],
                            inputs: [],
                            clientsConnected: [],
                            clientsDisconnected: [],
                            createObjects: [],
                            destroyObjects: []
                        };

                        // MOVE TO SYSTEM ?? We need to get world state

                        // Get all clients and add to clientsConnected and push to world state frame
                        for (const userId in Network.instance.clients) {
                            console.log(userId);
                            worldState.clientsConnected.push({ userId: Network.instance.clients[userId].userId });
                        }

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

                        // TODO: Get all inputs and add to inputs
                        // TODO: Convert the world state to a typed buffer

                        // Return initial world state to client to set things up
                        callback({
                            worldState /* worldState: worldStateModel.toBuffer(worldState) */,
                            routerRtpCapabilities: this.routers.instance.rtpCapabilities
                        });
                    } catch (error) {
                        logger.error('JoinWorld error');
                        logger.error(error);
                    }
                });
            });


            // If a reliable message is received, add it to the queue
            socket.on(MessageTypes.ReliableMessage.toString(), (message) => {
                try {
                    Network.instance.incomingMessageQueue.add(message);
                } catch (err) {
                    logger.error('Reliable Message error');
                    logger.error(err);
                }
            });

            socket.on(MessageTypes.Heartbeat.toString(), () => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    if (Network.instance.clients[userId] != undefined) Network.instance.clients[userId].lastSeenTs = Date.now();
                } catch (err) {
                    logger.error('Heartbeat error');
                    logger.error(err);
                }
            });

            // Handle the disconnection
            socket.on("disconnect", () => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
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
                        })


                        Network.instance.worldState.clientsDisconnected.push({ userId });
                        if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close();
                        if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close();
                        if (disconnectedClient?.partyRecvTransport) disconnectedClient.partyRecvTransport.close();
                        if (disconnectedClient?.partySendTransport) disconnectedClient.partySendTransport.close();
                        if (Network.instance.clients[userId] !== undefined)
                            delete Network.instance.clients[userId];
                    } else {
                        console.warn("Socket didn't match for disconnecting client");
                    }
                } catch (err) {
                    logger.error('socket disconnect error');
                    logger.error(err);
                }
            });

            // --> /signaling/leave
            // removes the peer from the roomState data structure and and closes
            // all associated mediasoup objects
            socket.on(MessageTypes.LeaveWorld.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    if (MediaStreamComponent.instance.transports)
                        for (const [, transport] of Object.entries(MediaStreamComponent.instance.transports))
                            if ((transport as any).appData.peerId === userId)
                                this.closeTransport(transport);
                    if (Network.instance.clients[userId] !== undefined)
                        delete Network.instance.clients[userId];
                    logger.info("Removing " + userId + " from client list");
                    if (callback !== undefined) callback({});
                } catch (err) {
                    logger.error('LeaveWorld error');
                    logger.error(err);
                }
            });

            // --> /signaling/create-transport
            // create a mediasoup transport object and send back info needed
            // to create a transport object on the client side
            socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: CreateWebRtcTransportParams, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    const { direction, peerId, sctpCapabilities, partyId } = Object.assign(data, { peerId: userId });
                    logger.info("WebRTCTransportCreateRequest: " + peerId + " " + direction);

                    const transport: WebRtcTransport = await this.createWebRtcTransport(
                        { peerId, direction, sctpCapabilities, partyId }
                    );

                    // this.transport = transport;

                    await transport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate);

                    MediaStreamComponent.instance.transports[transport.id] = transport;

                    // Distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
                    if (direction === 'recv') {
                        if (partyId === 'instance') Network.instance.clients[userId].instanceRecvTransport = transport;
                        else if (partyId != null) Network.instance.clients[userId].partyRecvTransport = transport;

                    } else if (direction === 'send') {
                        if (partyId === 'instance') Network.instance.clients[userId].instanceSendTransport = transport;
                        else if (partyId != null) Network.instance.clients[userId].partySendTransport = transport;
                    }

                    const { id, iceParameters, iceCandidates, dtlsParameters } = transport;

                    if (process.env.KUBERNETES === 'true') {
                        const serverResult = await (this.app as any).k8AgonesClient.get('gameservers');
                        const thisGs = serverResult.items.find(server => server.metadata.name === this.gameServer.objectMeta.name);
                        iceCandidates.forEach((candidate) => {
                            candidate.port = thisGs.spec?.ports?.find((portMapping) => portMapping.containerPort === candidate.port).hostPort;
                        });
                    }
                    const clientTransportOptions: MediaSoupClientTypes.TransportOptions = {
                        id,
                        sctpParameters: {
                            ...sctpParameters,
                            OS: sctpCapabilities.numStreams.OS,
                            MIS: sctpCapabilities.numStreams.MIS
                        },
                        iceParameters,
                        iceCandidates,
                        dtlsParameters
                    };

                    // Create data consumers for other clients if the current client transport receives data producer on it
                    transport.observer.on('newdataproducer', this.handleConsumeDataEvent(socket));
                    transport.observer.on('newproducer', this.sendCurrentProducers(socket, partyId));
                    callback({ transportOptions: clientTransportOptions });
                } catch (err) {
                    logger.error('WebRTC Transport create error');
                    logger.error(err);
                }
            });

            socket.on(MessageTypes.WebRTCProduceData.toString(), async (params, callback) => {
                logger.info('Produce Data handler');
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    if (!params.label) throw ({ error: 'data producer label i.e. channel name is not provided!' });
                    const { transportId, sctpStreamParameters, label, protocol, appData } = params;
                    logger.info(`Data channel label: ${label} -- user id: ` + userId);
                    logger.info("Data producer params", params);
                    const transport: Transport = MediaStreamComponent.instance.transports[transportId];
                    const options: DataProducerOptions = {
                        label,
                        protocol,
                        sctpStreamParameters,
                        appData: { ...(appData || {}), peerID: userId, transportId }
                    };
                    const dataProducer = await transport.produceData(options);

                    logger.info(`user ${userId} producing data`);
                    Network.instance.clients[userId].dataProducers.set(label, dataProducer);
                    // if our associated transport closes, close ourself, too
                    dataProducer.on("transportclose", () => {
                        logger.info("data producer's transport closed: " + dataProducer.id);
                        dataProducer.close();
                        Network.instance.clients[userId].dataProducers.delete(label);
                    });
                    // Possibly do stuff with appData here
                    logger.info("Sending dataproducer id to client:" + dataProducer.id);
                    return callback({ id: dataProducer.id });
                } catch (error) {
                    logger.error(error);
                }
            });

            // called from inside a client's `transport.on('connect')` event handler.
            socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    const { transportId, dtlsParameters } = data,
                        transport = MediaStreamComponent.instance.transports[transportId];
                    logger.info("WebRTCTransportConnectRequest: " + userId);
                    await transport.connect({ dtlsParameters });
                    logger.info(`transport for user ${userId} connected successfully`);
                    callback({ connected: true });
                } catch (err) {
                    logger.error('WebRTC transport connect error');
                    logger.error(err);
                    callback({ connected: false });
                }
            });

            // called by a client that wants to close a single transport (for
            // example, a client that is no longer sending any media).
            socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    logger.info("close-transport for user: " + userId);
                    const { transportId } = data;
                    const transport = MediaStreamComponent.instance.transports[transportId];
                    if (transport != null) await this.closeTransport(transport);
                    callback({ closed: true });
                } catch (err) {
                    logger.info('WebRTC Transport close error');
                    logger.info(err);
                    callback({ closed: true });
                }
            });

            // called by a client that is no longer sending a specific track
            socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    logger.info('Close Producer handler');
                    const { producerId } = data,
                        producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId);
                    await this.closeProducerAndAllPipeProducers(producer, userId);
                    callback({ closed: true });
                } catch (err) {
                    logger.error('WebRTC CloseProducer error');
                    logger.error(err);
                }
            });

            // called from inside a client's `transport.on('produce')` event handler.
            socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    logger.info('Send Track handler');
                    const { transportId, kind, rtpParameters, paused = false, appData } = data,
                        transport = MediaStreamComponent.instance.transports[transportId];

                    if (transport != null) {
                        const producer = await transport.produce({
                            kind,
                            rtpParameters,
                            paused,
                            appData: { ...appData, peerId: userId, transportId }
                        });

                        // if our associated transport closes, close ourself, too
                        producer.on("transportclose", () => {
                            this.closeProducerAndAllPipeProducers(producer, userId);
                        });

                        MediaStreamComponent.instance.producers.push(producer);
                        logger.info('New producer. Appdata:', appData);
                        Network.instance.clients[userId].media[appData.mediaTag] = {
                            paused,
                            producerId: producer.id,
                            globalMute: false,
                            encodings: rtpParameters.encodings,
                            partyId: appData.partyId
                        };

                        Object.keys(Network.instance.clients).forEach((key) => {
                            const client = Network.instance.clients[key];
                            if (client.userId !== userId) {
                                this.socketIO.to(client.socketId).emit(MessageTypes.WebRTCCreateProducer.toString(), userId, appData.mediaTag, producer.id, appData.partyId);
                            }
                        });
                        callback({ id: producer.id });
                    } else {
                        callback({ error: 'Invalid transport ID' });
                    }
                } catch (err) {
                    logger.error('sendtrack error:');
                    logger.error(err);
                }
            });

            // create a mediasoup consumer object, hook it up to a producer here
            // on the server side, and send back info needed to create a consumer
            // object on the client side. always start consumers paused. client
            // will request media to resume when the connection completes
            socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    logger.info('Receive Track handler');
                    const { mediaPeerId, mediaTag, rtpCapabilities, partyId } = data;
                    const producer = MediaStreamComponent.instance.producers.find(
                        p => p._appData.mediaTag === mediaTag && p._appData.peerId === mediaPeerId && p._appData.partyId === partyId
                    );
                    const router = this.routers[partyId];
                    if (producer == null || !router.canConsume({ producerId: producer.id, rtpCapabilities })) {
                        const msg = `client cannot consume ${mediaPeerId}:${mediaTag}`;
                        console.error(`recv-track: ${userId} ${msg}`);
                        callback({ error: msg });
                        return;
                    }

                    const transport = Object.values(MediaStreamComponent.instance.transports).find(
                        t => (t as any)._appData.peerId === userId && (t as any)._appData.clientDirection === "recv" && (t as any)._appData.partyId === partyId
                    );

                    const consumer = await (transport as any).consume({
                        producerId: producer.id,
                        rtpCapabilities,
                        paused: true, // see note above about always starting paused
                        appData: { peerId: userId, mediaPeerId, mediaTag, partyId: partyId }
                    });

                    // need both 'transportclose' and 'producerclose' event handlers,
                    // to make sure we close and clean up consumers in all
                    // circumstances
                    consumer.on("transportclose", () => {
                        logger.info(`consumer's transport closed`);
                        logger.info(consumer.id);
                        this.closeConsumer(consumer);
                    });
                    consumer.on("producerclose", () => {
                        logger.info(`consumer's producer closed`);
                        logger.info(consumer.id);
                        this.closeConsumer(consumer);
                    });
                    consumer.on('producerpause', () => {
                        logger.info(`consumer's producer paused`);
                        logger.info(consumer.id);
                        consumer.pause();
                        socket.emit(MessageTypes.WebRTCPauseConsumer.toString(), consumer.id);
                    });
                    consumer.on('producerresume', () => {
                        logger.info(`consumer's producer resumed`);
                        logger.info(consumer.id);
                        consumer.resume();
                        socket.emit(MessageTypes.WebRTCResumeConsumer.toString(), consumer.id);
                    });

                    // stick this consumer in our list of consumers to keep track of,
                    // and create a data structure to track the client-relevant state
                    // of this consumer
                    MediaStreamComponent.instance.consumers.push(consumer);
                    Network.instance.clients[userId].consumerLayers[consumer.id] = {
                        currentLayer: null,
                        clientSelectedLayer: null
                    };

                    // update above data structure when layer changes.
                    consumer.on("layerschange", layers => {
                        if (Network.instance.clients[userId] && Network.instance.clients[userId].consumerLayers[consumer.id])
                            Network.instance.clients[userId].consumerLayers[consumer.id].currentLayer = layers && layers.spatialLayer;
                    });

                    callback({
                        producerId: producer.id,
                        id: consumer.id,
                        kind: consumer.kind,
                        rtpParameters: consumer.rtpParameters,
                        type: consumer.type,
                        producerPaused: consumer.producerPaused
                    });
                } catch (err) {
                    logger.error(err);
                }
            });

            // called to pause receiving a track for a specific client
            socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) => {
                try {
                    const { consumerId } = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info("pause-consumer", consumer.appData);
                    await consumer.pause();
                    callback({ paused: true });
                } catch (err) {
                    logger.error('WebRTC PauseConsumer error');
                    logger.error(err);
                }
            });

            // called to resume receiving a track for a specific client
            socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) => {
                try {
                    const { consumerId } = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info("resume-consumer", consumer.appData);
                    await consumer.resume();
                    callback({ resumed: true });
                } catch (err) {
                    logger.error('WebRTC ResumeConsumer error');
                    logger.error(err);
                }
            });

            // --> /signalign/close-consumer
            // called to stop receiving a track for a specific client. close and
            // clean up consumer object
            socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) => {
                try {
                    const { consumerId } = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info(`Close Consumer handler: ${consumerId}`);
                    if (consumer != null) await this.closeConsumer(consumer);
                    callback({ closed: true });
                } catch (err) {
                    logger.error('WebRTC CloseConsumer error');
                    logger.error(err);
                }
            });

            // --> /signaling/consumer-set-layers
            // called to set the largest spatial layer that a specific client
            // wants to receive
            socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) => {
                try {
                    const { consumerId, spatialLayer } = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info("consumer-set-layers: ", spatialLayer, consumer.appData);
                    await consumer.setPreferredLayers({ spatialLayer });
                    callback({ layersSet: true });
                } catch (err) {
                    logger.error('WebRTC ConsumerSetLayers error');
                    logger.error(err);
                }
            });

            // --> /signaling/pause-producer
            // called to stop sending a track from a specific client
            // socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
            //     logger.info('Close Producer handler')
            //     const {producerId} = data,
            //         producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId)
            //     logger.info("pause-producer", producer.appData)
            //     await producer.pause()
            //     Network.instance.clients[userId].media[producer.appData.mediaTag].paused = true
            //     callback({paused: true})
            // })

            // --> /signaling/resume-producer
            // called to resume sending a track from a specific client
            socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    const { producerId } = data,
                        producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId);
                    logger.info("resume-producer", producer.appData);
                    await producer.resume();
                    Network.instance.clients[userId].media[producer.appData.mediaTag].paused = false;
                    Network.instance.clients[userId].media[producer.appData.mediaTag].globalMute = false;
                    const hostClient = Object.entries(Network.instance.clients).find(([name, client]) => {
                        return client.media[producer.appData.mediaTag]?.producerId === producerId;
                    });
                    this.socketIO.to(hostClient[1].socketId).emit(MessageTypes.WebRTCResumeProducer.toString(), producer.id);
                    callback({ resumed: true });
                } catch (err) {
                    logger.error('WebRTC ResumeProducer error');
                    logger.error(err);
                }
            });

            // --> /signaling/resume-producer
            // called to resume sending a track from a specific client
            socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) => {
                try {
                    const userId = this.getUserIdFromSocketId(socket.id);
                    const { producerId, globalMute } = data,
                        producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId);
                    logger.info("pause-producer: ", producer.appData);
                    await producer.pause();
                    Network.instance.clients[userId].media[producer.appData.mediaTag].paused = true;
                    Network.instance.clients[userId].media[producer.appData.mediaTag].globalMute = globalMute || false;
                    if (globalMute === true) {
                        const hostClient = Object.entries(Network.instance.clients).find(([name, client]) => {
                            return client.media[producer.appData.mediaTag]?.producerId === producerId;
                        });
                        this.socketIO.to(hostClient[1].socketId).emit(MessageTypes.WebRTCPauseProducer.toString(), producer.id, true);
                    }
                    callback({ paused: true });
                } catch (err) {
                    logger.error('WebRTC PauseProducer error');
                    logger.error(err);
                }
            });
        });
    }

    validateNetworkObjects(): void {
        for (const client in Network.instance.clients) {
            // Validate that user has phoned home in last 5 seconds
            if (Date.now() - Network.instance.clients[client].lastSeenTs > 5000) {
                console.log("Removing client ", client, " due to activity");
                if (!Network.instance.clients[client])
                    return console.warn('Client is not in client list');

                const disconnectedClient = Object.assign({}, Network.instance.clients[client]);

                Network.instance.worldState.clientsDisconnected.push({ client });
                if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close();
                if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close();
                if (disconnectedClient?.partyRecvTransport) disconnectedClient.partyRecvTransport.close();
                if (disconnectedClient?.partySendTransport) disconnectedClient.partySendTransport.close();

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
                    console.log("Removed entity ", (obj.component.entity as Entity).id, " for user ", client);
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
            console.log(key, " removed from simulation");
        })
    }

    // start mediasoup with a single worker and router
    async startMediasoup(): Promise<void> {
        logger.info("Starting WebRTC Server");
        // Initialize roomstate
        this.worker = await createWorker({
            logLevel: 'debug',
            rtcMinPort: localConfig.mediasoup.worker.rtcMinPort,
            rtcMaxPort: localConfig.mediasoup.worker.rtcMaxPort,
            // dtlsCertificateFile: serverConfig.server.certPath,
            // dtlsPrivateKeyFile: serverConfig.server.keyPath,
            logTags: ['sctp']
        });

        this.worker.on("died", () => {
            console.error("mediasoup worker died (this should never happen)");
            process.exit(1);
        });

        logger.info("Created Mediasoup worker");

        const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[];
        this.routers = { instance: await this.worker.createRouter({ mediaCodecs }) };
        logger.info("Worker created router");
    }

    sendCurrentProducers = (socket: SocketIO.Socket, partyId?: string) => async (
        producer: Producer
    ): Promise<void> => {
        try {
            const userId = this.getUserIdFromSocketId(socket.id);
            const selfClient = Network.instance.clients[userId];
            if (selfClient.socketId != null) {
                Object.entries(Network.instance.clients).forEach(([name, value]) => {
                    if (name === userId || value.media == null || value.socketId == null) return;
                    logger.info(`Sending media for ${name}`);
                    Object.entries(value.media).map(([subName, subValue]) => {
                        logger.info(`Emitting createProducer for user ${userId} of type ${subName}`);
                        logger.info(subValue);
                        if (partyId === (subValue as any).partyId) this.socketIO.to(selfClient.socketId).emit(MessageTypes.WebRTCCreateProducer.toString(), value.userId, subName, producer.id, partyId);
                    });
                });
            }
        } catch (err) {
            logger.error('sendCurrentProducers error');
            logger.error(err);
        }
    }
    getUserIdFromSocketId = (socketId): string | null => {
        try {
            let userId;
            for (const key in Network.instance.clients) {
                if (Network.instance.clients[key].socketId === socketId) {
                    userId = Network.instance.clients[key].userId;
                    break;
                }
            }
            if (userId === undefined) return null
            return userId;
        } catch (err) {
            logger.error('getUserIdFromSocketId error');
            logger.error(err);
        }
    }
    // Create consumer for each client!
    handleConsumeDataEvent = (socket: SocketIO.Socket) => async (
        dataProducer: DataProducer
    ): Promise<void> => {
        const userId = this.getUserIdFromSocketId(socket.id);
        logger.info('Data Consumer being created on server by client: ' + userId);
        Object.keys(Network.instance.clients).filter(id => id !== userId).forEach(async (otherUserId: string) => {
            try {
                const transport: Transport = Network.instance.clients[otherUserId].instanceRecvTransport;
                if (transport != null) {
                    const dataConsumer = await transport.consumeData({
                        dataProducerId: dataProducer.id,
                        appData: { peerId: userId, transportId: transport.id },
                        maxPacketLifeTime:
                            dataProducer.sctpStreamParameters.maxPacketLifeTime,
                        maxRetransmits: dataProducer.sctpStreamParameters.maxRetransmits,
                        ordered: false,
                    });
                    logger.info('Data Consumer created!');
                    dataConsumer.on('producerclose', () => {
                        dataConsumer.close();
                        Network.instance.clients[userId].dataConsumers.delete(
                            dataProducer.id
                        );
                    });
                    logger.info('Setting data consumer to room state');
                    Network.instance.clients[userId].dataConsumers.set(
                        dataProducer.id,
                        dataConsumer
                    );
                    // Currently Creating a consumer for each client and making it subscribe to the current producer
                    socket.to(otherUserId).emit(MessageTypes.WebRTCConsumeData.toString(), {
                        dataProducerId: dataProducer.id,
                        sctpStreamParameters: dataConsumer.sctpStreamParameters,
                        label: dataConsumer.label,
                        id: dataConsumer.id,
                        appData: dataConsumer.appData,
                        protocol: 'json',
                    } as MediaSoupClientTypes.DataConsumerOptions);
                }
            } catch (error) {
                logger.error(error);
            }
        });
    }

    async closeTransport(transport): Promise<void> {
        try {
            logger.info("closing transport " + transport.id, transport.appData);
            // our producer and consumer event handlers will take care of
            // calling closeProducer() and closeConsumer() on all the producers
            // and consumers associated with this transport
            await transport.close();
            delete MediaStreamComponent.instance.transports[transport.id];
        } catch (err) {
            logger.error('closeTranport error');
            logger.error(err);
        }
    }

    async closeProducer(producer): Promise<void> {
        try {
            logger.info("closing producer " + producer.id, producer.appData);
            await producer.close();

            MediaStreamComponent.instance.producers = MediaStreamComponent.instance.producers.filter(p => p.id !== producer.id);

            if (Network.instance.clients[producer.appData.peerId]) delete Network.instance.clients[producer.appData.peerId].media[producer.appData.mediaTag];
        } catch (err) {
            logger.error('CloseProducer error');
            logger.error(err);
        }
    }

    async closeProducerAndAllPipeProducers(producer, peerId): Promise<void> {
        if (producer != null) {
            try {
                logger.info("closing producer and all pipe producer " + producer.id, producer.appData);

                // remove this producer from our roomState.producers list
                MediaStreamComponent.instance.producers = MediaStreamComponent.instance.producers.filter(p => p.id !== producer.id);

                // finally, close the original producer
                await producer.close();

                // remove this producer from our roomState.producers list
                MediaStreamComponent.instance.producers = MediaStreamComponent.instance.producers.filter(p => p.id !== producer.id);
                MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter(c => !(c.appData.mediaTag === producer.appData.mediaTag && c._internal.producerId === producer.id));

                // remove this track's info from our roomState...mediaTag bookkeeping
                delete Network.instance.clients[producer.appData.peerId]?.media[producer.appData.mediaTag];
            } catch (err) {
                logger.error('ClosePipeProducer error');
                logger.error(err);
            }
        }
    }

    async closeConsumer(consumer): Promise<void> {
        logger.info("closing consumer", consumer.id);
        await consumer.close();

        MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter(c => c.id !== consumer.id);
        Object.entries(Network.instance.clients).forEach(([, value]) => {
            this.socketIO.to(value.socketId).emit(MessageTypes.WebRTCCloseConsumer.toString(), consumer.id);
        });

        delete Network.instance.clients[consumer.appData.peerId].consumerLayers[consumer.id];
    }

    async createWebRtcTransport({ peerId, direction, sctpCapabilities, partyId }: CreateWebRtcTransportParams): Promise<WebRtcTransport> {
        logger.info("Creating Mediasoup transport for", partyId);
        try {
            const { listenIps, initialAvailableOutgoingBitrate } = localConfig.mediasoup.webRtcTransport;
            const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[];
            if (partyId != null && partyId !== 'instance') {
                if (this.routers[partyId] == null) this.routers[partyId] = await this.worker.createRouter({ mediaCodecs });
                logger.info("Worker created router for party " + partyId);
            }
            const router = this.routers[partyId];
            const transport = await router.createWebRtcTransport({
                listenIps: listenIps,
                enableUdp: true,
                enableTcp: false,
                preferUdp: true,
                enableSctp: true, // Enabling it for setting up data channels
                numSctpStreams: sctpCapabilities.numStreams,
                initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
                appData: { peerId, partyId, clientDirection: direction }
            });

            return transport;
        } catch (err) {
            logger.error('WebRTC create transport error');
            logger.error(err);
        }
    }
}