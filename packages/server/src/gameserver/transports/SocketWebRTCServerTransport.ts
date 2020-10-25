import {MediaStreamComponent} from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import {Network} from "@xr3ngine/engine/src/networking/components/Network";
import {MessageTypes} from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import {NetworkTransport} from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import {
    CreateWebRtcTransportParams,
    UnreliableMessageReturn
} from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import * as https from "https";
import {createWorker} from 'mediasoup';
import {types as MediaSoupClientTypes} from "mediasoup-client";
import {SctpParameters} from "mediasoup-client/lib/SctpParameters";
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
import SocketIO, {Socket} from "socket.io";
import logger from "../../app/logger";
import getLocalServerIp from '../../util/get-local-server-ip';
import config from '../../config';
import AWS from 'aws-sdk';
import { handleClientDisconnected } from "@xr3ngine/engine/src/networking/functions/handleClientDisconnected";

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
            listenIps: [{ip: "192.168.0.81", announcedIp: null}],
            initialAvailableOutgoingBitrate: 800000,
            maxIncomingBitrate: 150000
        }
    }
};

const defaultRoomState = {
    // external
    activeSpeaker: {producerId: null, volume: null, peerId: null},
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
        if (!this.isInitialized) console.error("Not initialized");
        else this.socketIO.sockets.emit(MessageTypes.ReliableMessage.toString(), message);
    }

    async sendData(data: any, channel = 'default'): Promise<UnreliableMessageReturn> {
        if (this.transport === undefined) return;
        try {
            return await this.transport.produceData({
                appData: {data},
                sctpStreamParameters: data.sctpStreamParameters,
                label: channel,
                protocol: 'raw'
            });
        } catch (error) {
            console.log(error);
        }
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
        } catch(err) {
            console.log('get RTC port range error');
            console.log(err);
        }
    }

    public async initialize(address, port = 3030): Promise<void> {
        try {
            let gs;
            if (this.isInitialized) console.error("Already initialized transport");
            logger.info('Initializing server transport');

            let stringSubdomainNumber, gsResult;
            if (process.env.KUBERNETES === 'true') {
                gs = await (this.app as any).agonesSDK.getGameServer();
                const name = gs.objectMeta.name;
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
                announcedIp: process.env.KUBERNETES === 'true' ? (config.gameserver.local === true ? gsResult.status.address : `${stringSubdomainNumber}.${config.gameserver.domain}` ) : localIp.ipAddress
            }];
            this.socketIO = (this.app as any)?.io;

            this.socketIO.sockets.on("connect", (socket: Socket) => {
                logger.info('Socket Connected');
                Network.instance.clients[socket.id] = {
                    userId: socket.id,
                    socket: socket,
                    lastSeenTs: Date.now(),
                    joinTs: Date.now(),
                    media: {},
                    consumerLayers: {},
                    stats: {},
                    dataConsumers: new Map<string, DataConsumer>(), // Key => id of data producer
                    dataProducers: new Map<string, DataProducer>() // Key => label of data channel
                };

                console.log("NetworkClient: ", Network.instance.clients[socket.id])
                console.log("lastSeenTs", Network.instance.clients[socket.id].lastSeenTs)

                    // Every 5 seconds, check if this user is still connected
                const heartbeat = setInterval(()=> {
                    console.log("Date now: ", Date.now())
                    console.log("Network.instance.clients[socket.id].lastSeenTs: ", Network.instance.clients[socket.id].lastSeenTs)
                    if(Date.now() - Network.instance.clients[socket.id].lastSeenTs > 5000){
                        console.log("Removing client ", socket.id, " due to activity");
                        // Heartbeat hasn't been received in more than 5 seconds, so let's remove the client
                        handleClientDisconnected({ id: socket.id });
                        clearInterval(heartbeat);
                    }
                }, 5000)

                // Call all message handlers associated with client connection
                Network.instance.schema.messageHandlers[MessageTypes.ClientConnected.toString()].forEach(behavior => {
                    const client = Network.instance.clients[socket.id];
                    behavior.behavior(
                        {
                            id: socket.id,
                            media: client.media
                        },
                    );
                });

                // If a reliable message is received, add it to the queue
                socket.on(MessageTypes.ReliableMessage.toString(), (message) => {
                    Network.instance.incomingMessageQueue.add(message);
                });

                socket.on(MessageTypes.Heartbeat.toString(), () => {
                    Network.instance.clients[socket.id].lastSeenTs = Date.now();
                    console.log("Received heartbeat", Network.instance.clients[socket.id].lastSeenTs);
                })

                // Handle the disconnection
                socket.on("disconnect", () => {
                    try {
                        console.log(socket.id + " disconnected");
                        clearInterval(heartbeat);
                        Network.instance.worldState.clientsDisconnected.push(socket.id);
                        const disconnectedClient = Network.instance.clients[socket.id];
                        if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close();
                        if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close();
                        if (disconnectedClient?.partyRecvTransport) disconnectedClient.partyRecvTransport.close();
                        if (disconnectedClient?.partySendTransport) disconnectedClient.partySendTransport.close();
                        delete Network.instance.clients[socket.id];
                    } catch(err) {
                        console.log('socket disconnect error');
                        console.log(err);
                    }
                });

                socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) => {
                    // Add user ID to peer list
                    Network.instance.clients[socket.id].userId = socket.id;

                    // Prepare a worldstate frame
                    const worldState = {
                        tick: Network.tick,
                        transforms: [],
                        inputs: [],
                        clientsConnected: [],
                        clientsDisconnected: [],
                        createObjects: [],
                        destroyObjects: []
                    };

                    // Get all clients and add to clientsConnected
                    for (const clientId in Network.instance.clients)
                        worldState.clientsConnected.push({clientId, userId: Network.instance.clients[clientId].userId});

                    // Get all network objects and add to createObjects
                    for (const networkId in Network.instance.networkObjects)
                        worldState.createObjects.push({
                            prefabType: Network.instance.networkObjects[networkId].prefabType,
                            networkid: networkId,
                            ownerId: Network.instance.networkObjects[networkId].ownerId
                        });

                    // TODO: Get all inputs and add to inputs

                    try {
                        // Convert world state to buffer and send along
                        callback({
                            worldState /* worldState: worldStateModel.toBuffer(worldState) */,
                            routerRtpCapabilities: this.routers.instance.rtpCapabilities
                        });
                    } catch (error) {
                        console.log(error);
                    }
                });

                // --> /signaling/leave
                // removes the peer from the roomState data structure and and closes
                // all associated mediasoup objects
                socket.on(MessageTypes.LeaveWorld.toString(), async (data, callback) => {
                    try {
                        if (MediaStreamComponent.instance.transports)
                            for (const [, transport] of Object.entries(MediaStreamComponent.instance.transports))
                                if ((transport as any).appData.peerId === socket.id)
                                    this.closeTransport(transport);
                        delete Network.instance.clients[socket.id];
                        logger.info("Removing " + socket.id + " from client list");
                        callback({});
                    } catch(err) {
                        console.log('LeaveWorld error');
                        console.log(err);
                    }
                });

                // --> /signaling/create-transport
                // create a mediasoup transport object and send back info needed
                // to create a transport object on the client side
                socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: CreateWebRtcTransportParams, callback) => {
                    const {direction, peerId, sctpCapabilities, partyId} = Object.assign(data, {peerId: socket.id});
                    logger.info("WebRTCTransportCreateRequest: " + peerId + " " + direction);

                    const transport: WebRtcTransport = await this.createWebRtcTransport(
                        {peerId, direction, sctpCapabilities, partyId}
                    );

                    // this.transport = transport;

                    await transport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate);

                    MediaStreamComponent.instance.transports[transport.id] = transport;

                    // Distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
                    if (direction === 'recv') {
                        if (partyId === 'instance') Network.instance.clients[socket.id].instanceRecvTransport = transport;
                        else if (partyId != null) Network.instance.clients[socket.id].partyRecvTransport = transport;

                    } else if (direction === 'send') {
                        if (partyId === 'instance') Network.instance.clients[socket.id].instanceSendTransport = transport;
                        else if (partyId != null) Network.instance.clients[socket.id].partySendTransport = transport;
                    }

                    const {id, iceParameters, iceCandidates, dtlsParameters} = transport;

                    if (process.env.KUBERNETES === 'true') {
                        const serverResult = await (this.app as any).k8AgonesClient.get('gameservers');
                        const thisGs = serverResult.items.find(server => server.metadata.name === gs.objectMeta.name);
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
                    callback({transportOptions: clientTransportOptions});
                });

                socket.on(MessageTypes.WebRTCProduceData.toString(), async (params, callback) => {
                    logger.info('Produce Data handler');
                    try {
                        if (!params.label) throw ({error: 'data producer label i.e. channel name is not provided!'});
                        const {transportId, sctpStreamParameters, label, protocol, appData} = params;
                        logger.info(`Data channel label: ${label} -- client id: ` + socket.id);
                        logger.info("Data producer params", params);
                        const transport: Transport = MediaStreamComponent.instance.transports[transportId];
                        const options: DataProducerOptions = {
                            label,
                            protocol,
                            sctpStreamParameters,
                            appData: {...(appData || {}), peerID: socket.id, transportId}
                        };
                        const dataProducer = await transport.produceData(options);

                        console.log(`socket ${socket.id} producing data`);
                        // console.log(Network.instance.clients[socket.id])
                        if (Network.instance.clients[socket.id].dataProducers)
                            Network.instance.clients[socket.id].dataProducers.set(label, dataProducer);
                        else console.log("Network.instance.clients[socket.id].dataProducers is nulled" + Network.instance.clients[socket.id].dataProducers);
                        // if our associated transport closes, close ourself, too
                        dataProducer.on("transportclose", () => {
                            logger.info("data producer's transport closed: " + dataProducer.id);
                            dataProducer.close();
                            Network.instance.clients[socket.id].dataProducers.delete(socket.id);
                        });
                        // Possibly do stuff with appData here
                        logger.info("Sending dataproducer id to client:" + dataProducer.id);
                        return callback({id: dataProducer.id});
                    } catch (error) {
                        console.log(error);
                    }
                });

                // called from inside a client's `transport.on('connect')` event handler.
                socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) => {
                    try {
                        const {transportId, dtlsParameters} = data,
                            transport = MediaStreamComponent.instance.transports[transportId];
                        logger.info("WebRTCTransportConnectRequest: " + socket.id);
                        await transport.connect({dtlsParameters});
                        logger.info(`transport ${socket.id} connected successfully`);
                        callback({connected: true});
                    } catch(err) {
                        console.log('WebRTC transport connect error');
                        console.log(err);
                        callback({connected: false});
                    }
                });

                // called by a client that wants to close a single transport (for
                // example, a client that is no longer sending any media).
                socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) => {
                    try {
                        logger.info("close-transport: " + socket.id);
                        const {transportId} = data;
                        const transport = MediaStreamComponent.instance.transports[transportId];
                        if (transport != null) await this.closeTransport(transport);
                        callback({closed: true});
                    } catch (err) {
                        logger.info('WebRTC Transport close error');
                        logger.info(err);
                        callback({closed: true});
                    }
                });

                // called by a client that is no longer sending a specific track
                socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
                    logger.info('Close Producer handler');
                    const {producerId} = data,
                        producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId);
                    await this.closeProducerAndAllPipeProducers(producer, socket.id);
                    callback({closed: true});
                });

                // called from inside a client's `transport.on('produce')` event handler.
                socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) => {
                    try {
                        logger.info('Send Track handler');
                        const {transportId, kind, rtpParameters, paused = false, appData} = data,
                            transport = MediaStreamComponent.instance.transports[transportId];

                        const producer = await transport.produce({
                            kind,
                            rtpParameters,
                            paused,
                            appData: {...appData, peerId: socket.id, transportId}
                        });

                        // if our associated transport closes, close ourself, too
                        producer.on("transportclose", () => {
                            this.closeProducerAndAllPipeProducers(producer, socket.id);
                        });

                        logger.info('New producer');

                        MediaStreamComponent.instance.producers.push(producer);
                        console.log('Producer appdata:');
                        console.log(appData);
                        Network.instance.clients[socket.id].media[appData.mediaTag] = {
                            paused,
                            producerId: producer.id,
                            globalMute: false,
                            encodings: rtpParameters.encodings,
                            partyId: appData.partyId
                        };

                        Object.keys(Network.instance.clients).forEach((key) => {
                            const client = Network.instance.clients[key];
                            if (client.socket.id !== socket.id) {
                                client.socket.emit(MessageTypes.WebRTCCreateProducer.toString(), socket.id, appData.mediaTag, producer.id, appData.partyId);
                            }
                        });

                        callback({id: producer.id});
                    } catch (err) {
                        console.log('sendtrack error:');
                        console.log(err);
                    }
                });

                // create a mediasoup consumer object, hook it up to a producer here
                // on the server side, and send back info needed to create a consumer
                // object on the client side. always start consumers paused. client
                // will request media to resume when the connection completes
                socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) => {
                    try {
                        logger.info('Receive Track handler');
                        const {mediaPeerId, mediaTag, rtpCapabilities, partyId} = data;
                        console.log(`Socket id: ${socket.id}`);
                        console.log(`partyId: ${partyId}`);
                        const producer = MediaStreamComponent.instance.producers.find(
                            p => p._appData.mediaTag === mediaTag && p._appData.peerId === mediaPeerId && p._appData.partyId === partyId
                        );
                        const router = this.routers[partyId];
                        if (producer == null || !router.canConsume({producerId: producer.id, rtpCapabilities})) {
                            const msg = `client cannot consume ${mediaPeerId}:${mediaTag}`;
                            console.error(`recv-track: ${socket.id} ${msg}`);
                            callback({error: msg});
                            return;
                        }

                        const transport = Object.values(MediaStreamComponent.instance.transports).find(
                            t => (t as any)._appData.peerId === socket.id && (t as any)._appData.clientDirection === "recv" && (t as any)._appData.partyId === partyId
                        );

                        const consumer = await (transport as any).consume({
                            producerId: producer.id,
                            rtpCapabilities,
                            paused: true, // see note above about always starting paused
                            appData: {peerId: socket.id, mediaPeerId, mediaTag, partyId: partyId}
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
                        Network.instance.clients[socket.id].consumerLayers[consumer.id] = {
                            currentLayer: null,
                            clientSelectedLayer: null
                        };

                        // update above data structure when layer changes.
                        consumer.on("layerschange", layers => {
                            if (Network.instance.clients[socket.id] && Network.instance.clients[socket.id].consumerLayers[consumer.id])
                                Network.instance.clients[socket.id].consumerLayers[consumer.id].currentLayer = layers && layers.spatialLayer;
                        });

                        callback({
                            producerId: producer.id,
                            id: consumer.id,
                            kind: consumer.kind,
                            rtpParameters: consumer.rtpParameters,
                            type: consumer.type,
                            producerPaused: consumer.producerPaused
                        });
                    } catch(err) {
                        console.log(err);
                    }
                });

                // called to pause receiving a track for a specific client
                socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) => {
                    const {consumerId} = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info("pause-consumer", consumer.appData);
                    await consumer.pause();
                    callback({paused: true});

                });

                // called to resume receiving a track for a specific client
                socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) => {
                    const {consumerId} = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info("resume-consumer", consumer.appData);
                    await consumer.resume();
                    callback({resumed: true});
                });

                // --> /signalign/close-consumer
                // called to stop receiving a track for a specific client. close and
                // clean up consumer object
                socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) => {
                    const {consumerId} = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info(`Close Consumer handler: ${consumerId}`);
                    await this.closeConsumer(consumer);
                    callback({closed: true});
                });

                // --> /signaling/consumer-set-layers
                // called to set the largest spatial layer that a specific client
                // wants to receive
                socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) => {
                    const {consumerId, spatialLayer} = data,
                        consumer = MediaStreamComponent.instance.consumers.find(c => c.id === consumerId);
                    logger.info("consumer-set-layers: ", spatialLayer, consumer.appData);
                    await consumer.setPreferredLayers({spatialLayer});
                    callback({layersSet: true});
                });

                // --> /signaling/pause-producer
                // called to stop sending a track from a specific client
                // socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
                //     logger.info('Close Producer handler')
                //     const {producerId} = data,
                //         producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId)
                //     logger.info("pause-producer", producer.appData)
                //     await producer.pause()
                //     Network.instance.clients[socket.id].media[producer.appData.mediaTag].paused = true
                //     callback({paused: true})
                // })

                // --> /signaling/resume-producer
                // called to resume sending a track from a specific client
                socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) => {
                    const {producerId} = data,
                        producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId);
                    logger.info("resume-producer", producer.appData);
                    await producer.resume();
                    Network.instance.clients[socket.id].media[producer.appData.mediaTag].paused = false;
                    Network.instance.clients[socket.id].media[producer.appData.mediaTag].globalMute = false;
                    const hostClient = Object.entries(Network.instance.clients).find(([name,client]) => {
                        return client.media[producer.appData.mediaTag]?.producerId === producerId;
                    });
                    hostClient[1].socket.emit(MessageTypes.WebRTCResumeProducer.toString(), producer.id);
                    callback({resumed: true});
                });

                // --> /signaling/resume-producer
                // called to resume sending a track from a specific client
                socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) => {
                    const {producerId, globalMute } = data,
                        producer = MediaStreamComponent.instance.producers.find(p => p.id === producerId);
                    logger.info("pause-producer: ", producer.appData);
                    await producer.pause();
                    Network.instance.clients[socket.id].media[producer.appData.mediaTag].paused = true;
                    Network.instance.clients[socket.id].media[producer.appData.mediaTag].globalMute = globalMute || false;
                    if (globalMute === true) {
                        const hostClient = Object.entries(Network.instance.clients).find(([name,client]) => {
                            return client.media[producer.appData.mediaTag]?.producerId === producerId;
                        });
                        hostClient[1].socket.emit(MessageTypes.WebRTCPauseProducer.toString(), producer.id, true);
                    }
                    callback({paused: true});
                });
            });
            this.isInitialized = true;
        } catch(err) {
            console.log('Server transport initialize error:');
            console.log(err);
        }
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
        this.routers = {instance: await this.worker.createRouter({mediaCodecs})};
        logger.info("Worker created router");
    }

    sendCurrentProducers = (socket: SocketIO.Socket, partyId?: string) => async (
        producer: Producer
    ): Promise<void> => {
        console.log('Creating consumers for existing client media');
        console.log('This transport\'s partyId: ' + partyId);
        const selfClient = Network.instance.clients[socket.id];
        if (selfClient.socket != null) {
            Object.entries(Network.instance.clients).forEach(([name, value]) => {
                if (name === socket.id || value.media == null || value.socket == null) return;
                console.log(`Sending media for ${name}`);
                Object.entries(value.media).map(([subName, subValue]) => {
                    console.log(`Emitting createProducer for socket ${socket.id} of type ${subName}`);
                    console.log(subValue);
                    if (partyId === (subValue as any).partyId) selfClient.socket.emit(MessageTypes.WebRTCCreateProducer.toString(), value.userId, subName, producer.id, partyId);
                });
            });
        }
    }
    // Create consumer for each client!
    handleConsumeDataEvent = (socket: SocketIO.Socket) => async (
        dataProducer: DataProducer
    ): Promise<void> => {
        logger.info('Data Consumer being created on server by client: ' + socket.id);
        Object.keys(Network.instance.clients).filter(id => id !== socket.id).forEach(async (socketId: string) => {
            try {
                const transport: Transport = Network.instance.clients[socketId].instanceRecvTransport;
                if (transport != null) {
                    const dataConsumer = await transport.consumeData({
                        dataProducerId: dataProducer.id,
                        appData: {peerId: socket.id, transportId: transport.id},
                        maxPacketLifeTime:
                        dataProducer.sctpStreamParameters.maxPacketLifeTime,
                        maxRetransmits: dataProducer.sctpStreamParameters.maxRetransmits,
                        ordered: false,
                    });
                    logger.info('Data Consumer created!');
                    dataConsumer.on('producerclose', () => {
                        dataConsumer.close();
                        Network.instance.clients[socket.id].dataConsumers.delete(
                            dataProducer.id
                        );
                    });
                    logger.info('Setting data consumer to room state');
                    Network.instance.clients[socket.id].dataConsumers.set(
                        dataProducer.id,
                        dataConsumer
                    );
                    // Currently Creating a consumer for each client and making it subscribe to the current producer
                    socket.to(socketId).emit(MessageTypes.WebRTCConsumeData.toString(), {
                        dataProducerId: dataProducer.id,
                        sctpStreamParameters: dataConsumer.sctpStreamParameters,
                        label: dataConsumer.label,
                        id: dataConsumer.id,
                        appData: dataConsumer.appData,
                        protocol: 'json',
                    } as MediaSoupClientTypes.DataConsumerOptions);
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    async closeTransport(transport): Promise<void> {
        logger.info("closing transport " + transport.id, transport.appData);
        // our producer and consumer event handlers will take care of
        // calling closeProducer() and closeConsumer() on all the producers
        // and consumers associated with this transport
        await transport.close();
        delete MediaStreamComponent.instance.transports[transport.id];
    }

    async closeProducer(producer): Promise<void> {
        logger.info("closing producer " + producer.id, producer.appData);
        await producer.close();

        MediaStreamComponent.instance.producers = MediaStreamComponent.instance.producers.filter(p => p.id !== producer.id);

        if (Network.instance.clients[producer.appData.peerId])
            delete Network.instance.clients[producer.appData.peerId].media[producer.appData.mediaTag];
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
            } catch(err) {
                console.log('ClosePipeProducer error');
                console.log(err);
            }
        }
    }

    async closeConsumer(consumer): Promise<void> {
        logger.info("closing consumer " + consumer.id);
        await consumer.close();

        MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter(c => c.id !== consumer.id);
        Object.entries(Network.instance.clients).forEach(([, value]) => {
            value.socket.emit(MessageTypes.WebRTCCloseConsumer, consumer.id);
        });

        delete Network.instance.clients[consumer.appData.peerId].consumerLayers[consumer.id];
    }

    async createWebRtcTransport({peerId, direction, sctpCapabilities, partyId}: CreateWebRtcTransportParams): Promise<WebRtcTransport> {
        logger.info("Creating Mediasoup transport");
        console.log(partyId);
        try {
            const {listenIps, initialAvailableOutgoingBitrate} = localConfig.mediasoup.webRtcTransport;
            const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[];
            if (partyId != null && partyId !== 'instance') {
                if (this.routers[partyId] == null) this.routers[partyId] = await this.worker.createRouter({mediaCodecs});
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
                appData: {peerId, partyId, clientDirection: direction}
            });

            return transport;
        } catch(err) {
            console.log('WebRTC create transport error');
            console.log(err);
        }
    }
}