import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { Network } from "@xr3ngine/engine/src/networking//classes/Network";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { CreateWebRtcTransportParams } from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import { createWorker } from 'mediasoup';
import { types as MediaSoupClientTypes } from "mediasoup-client";
import { DataProducer, DataConsumer, DataProducerOptions, Producer, RtpCodecCapability, Transport, WebRtcTransport } from "mediasoup/lib/types";
import SocketIO from "socket.io";
import logger from "../../app/logger";
import { localConfig, sctpParameters } from './config';
import { getUserIdFromSocketId } from "./NetworkFunctions";


const toArrayBuffer = (buf): any => {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
};

let networkTransport: any;
export async function startWebRTC(): Promise<void> {
    networkTransport = Network.instance.transport as any;
    logger.info("Starting WebRTC Server");
    // Initialize roomstate
    networkTransport.worker = await createWorker({
        logLevel: 'debug',
        rtcMinPort: localConfig.mediasoup.worker.rtcMinPort,
        rtcMaxPort: localConfig.mediasoup.worker.rtcMaxPort,
        // dtlsCertificateFile: serverConfig.server.certPath,
        // dtlsPrivateKeyFile: serverConfig.server.keyPath,
        logTags: ['sctp']
    });

    networkTransport.worker.on("died", () => {
        console.error("mediasoup worker died (this should never happen)");
        process.exit(1);
    });

    logger.info("Created Mediasoup worker");

    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[];
    networkTransport.routers = { instance: await networkTransport.worker.createRouter({ mediaCodecs }) };
    logger.info("Worker created router");
}

export const sendCurrentProducers = (socket: SocketIO.Socket, channelType: string, channelId?: string) => async (
    producer: Producer
): Promise<void> => {
    networkTransport = Network.instance.transport as any;
    const userId = getUserIdFromSocketId(socket.id);
    const selfClient = Network.instance.clients[userId];
    if (selfClient?.socketId != null) {
        Object.entries(Network.instance.clients).forEach(([name, value]) => {
            if (name === userId || value.media == null || value.socketId == null)
                return;
            logger.info(`Sending media for ${name}`);
            Object.entries(value.media).map(([subName, subValue]) => {
                if (channelType === 'instance' ? 'instance' === (subValue as any).channelType : (subValue as any).channelType === channelType && (subValue as any).channelId === channelId)
                    selfClient.socket.emit(MessageTypes.WebRTCCreateProducer.toString(), value.userId, subName, producer.id, channelType, channelId);
            });
        });
    }
};
// Create consumer for each client!
export const sendInitialProducers = async (socket: SocketIO.Socket, channelType: string, channelId?: string): Promise<void> => {
    networkTransport = Network.instance.transport as any;
    const userId = getUserIdFromSocketId(socket.id);
    const selfClient = Network.instance.clients[userId];
    if (selfClient?.socketId != null) {
        Object.entries(Network.instance.clients).forEach(([name, value]) => {
            // console.log(name);
            // console.log(value);
            if (name === userId || value.media == null || value.socketId == null)
                return;
            console.log(`Sending media for ${name}`);
            console.log(value.media);
            Object.entries(value.media).map(([subName, subValue]) => {
                if (channelType === 'instance' ? 'instance' === (subValue as any).channelType : (subValue as any).channelType === channelType && (subValue as any).channelId === channelId)
                    selfClient.socket.emit(MessageTypes.WebRTCCreateProducer.toString(), value.userId, subName, (subValue as any).producerId, channelType, channelId);
            });
        });
    }
};

export const handleConsumeDataEvent = (socket: SocketIO.Socket) => async (
    dataProducer: DataProducer
): Promise<void> => {
    networkTransport = Network.instance.transport as any;
    const userId = getUserIdFromSocketId(socket.id);
    logger.info('Data Consumer being created on server by client: ' + userId);
    const newTransport: Transport = Network.instance.clients[userId].instanceRecvTransport;
    const outgoingDataProducer = networkTransport.outgoingDataProducer;
    const dataConsumer = await newTransport.consumeData({
        dataProducerId: outgoingDataProducer.id,
        appData: { peerId: userId, transportId: newTransport.id },
    });
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

    const dataProducerOut = Network.instance.clients[userId].dataProducers.get('default');
    // Data consumers are all consuming the single producer that outputs from the server's message queue
    socket.emit(MessageTypes.WebRTCConsumeData.toString(), {
        dataProducerId: dataProducerOut.id,
        sctpStreamParameters: dataConsumer.sctpStreamParameters,
        label: dataConsumer.label,
        id: dataConsumer.id,
        appData: dataConsumer.appData,
        protocol: 'raw',
    } as MediaSoupClientTypes.DataConsumerOptions);
};

export async function closeTransport(transport): Promise<void> {
    logger.info("closing transport " + transport.id, transport.appData);
    // our producer and consumer event handlers will take care of
    // calling closeProducer() and closeConsumer() on all the producers
    // and consumers associated with this transport
    await transport.close();
    delete Network.instance.transports[transport.id];
}
export async function closeProducer(producer): Promise<void> {
    logger.info("closing producer " + producer.id, producer.appData);
    await producer.close();

    if(MediaStreamSystem.instance) MediaStreamSystem.instance.producers = MediaStreamSystem.instance?.producers.filter(p => p.id !== producer.id);

    if (Network.instance.clients[producer.appData.peerId]) delete Network.instance.clients[producer.appData.peerId].media[producer.appData.mediaTag];
}

export async function closeProducerAndAllPipeProducers(producer, peerId): Promise<void> {
    if (producer != null) {
        logger.info("closing producer and all pipe producer " + producer.id, producer.appData);

        // remove this producer from our roomState.producers list
        if(MediaStreamSystem.instance) MediaStreamSystem.instance.producers = MediaStreamSystem.instance?.producers.filter(p => p.id !== producer.id);

        // finally, close the original producer
        await producer.close();

        // remove this producer from our roomState.producers list
        if(MediaStreamSystem.instance) MediaStreamSystem.instance.producers = MediaStreamSystem.instance?.producers.filter(p => p.id !== producer.id);
        if(MediaStreamSystem.instance) MediaStreamSystem.instance.consumers = MediaStreamSystem.instance?.consumers.filter(c => !(c.appData.mediaTag === producer.appData.mediaTag && c._internal.producerId === producer.id));

        // remove this track's info from our roomState...mediaTag bookkeeping
        delete Network.instance.clients[producer.appData.peerId]?.media[producer.appData.mediaTag];
    }
}

export async function closeConsumer(consumer): Promise<void> {
    logger.info("closing consumer", consumer.id);
    await consumer.close();

    if(MediaStreamSystem.instance) MediaStreamSystem.instance.consumers = MediaStreamSystem.instance?.consumers.filter(c => c.id !== consumer.id);
    Object.entries(Network.instance.clients).forEach(([, value]) => {
        value.socket.emit(MessageTypes.WebRTCCloseConsumer.toString(), consumer.id);
    });

    delete Network.instance.clients[consumer.appData.peerId]?.consumerLayers[consumer.id];
}

export async function createWebRtcTransport({ peerId, direction, sctpCapabilities, channelType, channelId }: CreateWebRtcTransportParams): Promise<WebRtcTransport> {
    networkTransport = Network.instance.transport as any;
    console.log("Creating Mediasoup transport for ", channelType, channelId);
    const { listenIps, initialAvailableOutgoingBitrate } = localConfig.mediasoup.webRtcTransport;
    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[];
    if (channelType !== 'instance') {
        if (networkTransport.routers[`${channelType}:${channelId}`] == null)
            networkTransport.routers[`${channelType}:${channelId}`] = await networkTransport.worker.createRouter({ mediaCodecs });
        logger.info("Worker created router for channel " + `${channelType}:${channelId}`);
    }

    const router = channelType === 'instance' ? networkTransport.routers.instance : networkTransport.routers[`${channelType}:${channelId}`];
    const newTransport = await router.createWebRtcTransport({
        listenIps: listenIps,
        enableUdp: true,
        enableTcp: false,
        preferUdp: true,
        enableSctp: true,
        numSctpStreams: sctpCapabilities.numStreams,
        initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
        appData: { peerId, channelType, channelId, clientDirection: direction }
    });

    logger.info('New transport to return:');
    logger.info(newTransport);
    return newTransport;
}

export async function createInternalDataConsumer(dataProducer: DataProducer, userId: string): Promise<DataConsumer> {
    networkTransport = Network.instance.transport as any;
    const consumer = await networkTransport.outgoingDataTransport.consumeData({
        dataProducerId: dataProducer.id,
        appData: { peerId: userId, transportId: networkTransport.outgoingDataTransport.id },
        maxPacketLifeTime: dataProducer.sctpStreamParameters.maxPacketLifeTime,
        maxRetransmits: dataProducer.sctpStreamParameters.maxRetransmits,
        ordered: false,
    });
    consumer.on('message', (message) => {
        Network.instance.incomingMessageQueue.add(toArrayBuffer(message));
    });
    return consumer;
}

export async function handleWebRtcTransportCreate(socket, data: CreateWebRtcTransportParams, callback): Promise<any> {
    networkTransport = Network.instance.transport as any;
    const userId = getUserIdFromSocketId(socket.id);
    const { direction, peerId, sctpCapabilities, channelType, channelId } = Object.assign(data, { peerId: userId });

    const existingTransports = MediaStreamSystem.instance.transports.filter(t => t.appData.peerId === peerId && t.appData.direction === direction && (channelType === 'instance' ? t.appData.channelType === 'instance' : t.appData.channelType === channelType && t.appData.channelId === channelId));
    await Promise.all(existingTransports.map(t => closeTransport(t)));
    const newTransport: WebRtcTransport = await createWebRtcTransport(
        { peerId, direction, sctpCapabilities, channelType, channelId }
    );

    // transport.transport = transport;

    await newTransport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate);

    Network.instance.transports[newTransport.id] = newTransport;

    // Distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
    if (direction === 'recv') {
        if (channelType === 'instance') Network.instance.clients[userId].instanceRecvTransport = newTransport;
        else if (channelType !== 'instance' && channelId != null) Network.instance.clients[userId].channelRecvTransport = newTransport;
    } else if (direction === 'send') {
        if (channelType === 'instance' && Network.instance.clients[userId] != null) Network.instance.clients[userId].instanceSendTransport = newTransport;
        else if (channelType !== 'instance' && channelId != null && Network.instance.clients[userId] != null) Network.instance.clients[userId].channelSendTransport = newTransport;
    }

    const { id, iceParameters, iceCandidates, dtlsParameters } = newTransport;

    if (process.env.KUBERNETES === 'true') {
        const serverResult = await (networkTransport.app as any).k8AgonesClient.get('gameservers');
        const thisGs = serverResult.items.find(server => server.metadata.name === networkTransport.gameServer.objectMeta.name);
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

    newTransport.observer.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') closeTransport(newTransport);
    });
    // Create data consumers for other clients if the current client transport receives data producer on it
    newTransport.observer.on('newdataproducer', handleConsumeDataEvent(socket));
    newTransport.observer.on('newproducer', sendCurrentProducers(socket, channelType, channelId));
    callback({ transportOptions: clientTransportOptions });
}

export async function handleWebRtcProduceData(socket, data, callback): Promise<any> {
    networkTransport = Network.instance.transport as any;    
    const userId = getUserIdFromSocketId(socket.id);
    if (!data.label) throw ({ error: 'data producer label i.e. channel name is not provided!' });
    const { transportId, sctpStreamParameters, label, protocol, appData } = data;
    logger.info(`Data channel label: ${label} -- user id: ` + userId);
    logger.info("Data producer params", data);
    const transport: Transport = Network.instance.transports[transportId];
    const options: DataProducerOptions = {
        label,
        protocol,
        sctpStreamParameters,
        appData: { ...(appData || {}), peerID: userId, transportId }
    };
    const dataProducer = await transport.produceData(options);
    networkTransport.dataProducers.push(dataProducer);
    logger.info(`user ${userId} producing data`);
    Network.instance.clients[userId].dataProducers.set(label, dataProducer);
    // if our associated transport closes, close ourself, too
    dataProducer.on("transportclose", () => {
        networkTransport.dataProducers.splice(networkTransport.dataProducers.indexOf(dataProducer), 1);
        logger.info("data producer's transport closed: " + dataProducer.id);
        dataProducer.close();
        Network.instance.clients[userId].dataProducers.delete(label);
    });
    const internalConsumer = await createInternalDataConsumer(dataProducer, userId);
    Network.instance.clients[userId].dataConsumers.set(label, internalConsumer);
        // transport.handleConsumeDataEvent(socket);
    logger.info("transport.handleConsumeDataEvent(socket);");
    // Possibly do stuff with appData here
    logger.info("Sending dataproducer id to client:" + dataProducer.id);
    return callback({ id: dataProducer.id });
}

export async function handleWebRtcTransportClose(socket, data, callback): Promise<any> {
    networkTransport = Network.instance.transport as any;
    const userId = getUserIdFromSocketId(socket.id);
    const { transportId } = data;
    const transport = Network.instance.transports[transportId];
    if (transport != null) await closeTransport(transport).catch(err => logger.error(err));
    callback({ closed: true });
}

export async function handleWebRtcTransportConnect(socket, data, callback): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    const { transportId, dtlsParameters } = data,
        transport = Network.instance.transports[transportId];
    await transport.connect({ dtlsParameters }).catch(err => {
        logger.error(err);
        callback({ connected: false });
        return;
    });
    callback({ connected: true });
}

export async function handleWebRtcCloseProducer(socket, data, callback): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    const { producerId } = data, producer = MediaStreamSystem.instance?.producers.find(p => p.id === producerId);
    await closeProducerAndAllPipeProducers(producer, userId).catch(err => logger.error(err));
    callback({ closed: true });
}

export async function handleWebRtcSendTrack(socket, data, callback): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    const { transportId, kind, rtpParameters, paused = false, appData } =
        data, transport = Network.instance.transports[transportId];

    if (transport == null) return callback({ error: 'Invalid transport ID' });

    const producer = await transport.produce({
        kind,
        rtpParameters,
        paused,
        appData: { ...appData, peerId: userId, transportId }
    });

    producer.on("transportclose", () => closeProducerAndAllPipeProducers(producer, userId));

    if(!MediaStreamSystem.instance?.producers) console.warn("Media stream producers is undefined")
    MediaStreamSystem.instance?.producers?.push(producer);

    if (userId != null && Network.instance.clients[userId] != null) {
        Network.instance.clients[userId].media[appData.mediaTag] = {
            paused,
            producerId: producer.id,
            globalMute: false,
            encodings: rtpParameters.encodings,
            channelType: appData.channelType,
            channelId: appData.channelId
        };
    }

    Object.keys(Network.instance.clients).forEach((key) => {
        const client = Network.instance.clients[key];
        if (client.userId !== userId)
            client.socket.emit(MessageTypes.WebRTCCreateProducer.toString(), userId, appData.mediaTag, producer.id, appData.channelType, appData.channelId);
    });
    callback({ id: producer.id });
}

export async function handleWebRtcReceiveTrack(socket, data, callback): Promise<any> {
    networkTransport = Network.instance.transport as any;
    const userId = getUserIdFromSocketId(socket.id);
    const { mediaPeerId, mediaTag, rtpCapabilities, channelType, channelId } = data;
    console.log('Receive track for ', channelType, channelId);
    console.log(MediaStreamSystem.instance.producers);
    const producer = MediaStreamSystem.instance.producers.find(
        p => p._appData.mediaTag === mediaTag && p._appData.peerId === mediaPeerId && (channelType === 'instance' ? p._appData.channelType === channelType : p._appData.channelType === channelType && p._appData.channelId === channelId)
    );
    const router = channelType === 'instance' ? networkTransport.routers.instance : networkTransport.routers[`${channelType}:${channelId}`];
    if (producer == null || !router.canConsume({ producerId: producer.id, rtpCapabilities })) {
        const msg = `client cannot consume ${mediaPeerId}:${mediaTag}`;
        console.error(`recv-track: ${userId} ${msg}`);
        return callback({ error: msg });
    }

    const transport = Object.values(MediaStreamSystem.instance.transports).find(
        t => (t as any)._appData.peerId === userId && (t as any)._appData.clientDirection === "recv" && (channelType === 'instance' ? (t as any)._appData.channelType === channelType : (t as any)._appData.channelType === channelType && (t as any)._appData.channelId === channelId) && (t as any).closed === false
    );

    if (transport != null) {
        const consumer = await (transport as any).consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true, // see note above about always starting paused
            appData: {peerId: userId, mediaPeerId, mediaTag, channelType: channelType, channelId: channelId}
        });

        // we need both 'transportclose' and 'producerclose' event handlers,
        // to make sure we close and clean up consumers in all circumstances
        consumer.on("transportclose", () => {
            logger.info(`consumer's transport closed`);
            logger.info(consumer.id);
            closeConsumer(consumer);
        });
        consumer.on("producerclose", () => {
            logger.info(`consumer's producer closed`);
            logger.info(consumer.id);
            closeConsumer(consumer);
        });
        consumer.on('producerpause', () => {
            logger.info(`consumer's producer paused`);
            logger.info(consumer.id);
            if (consumer && typeof consumer.pause === 'function') consumer.pause();
            socket.emit(MessageTypes.WebRTCPauseConsumer.toString(), consumer.id);
        });
        consumer.on('producerresume', () => {
            logger.info(`consumer's producer resumed`);
            logger.info(consumer.id);
            if (consumer && typeof consumer.resume === 'function') consumer.resume();
            socket.emit(MessageTypes.WebRTCResumeConsumer.toString(), consumer.id);
        });

        // stick this consumer in our list of consumers to keep track of
        MediaStreamSystem.instance?.consumers.push(consumer);

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
    } else {
        callback({
            id: null
        });
    }
}

export async function handleWebRtcPauseConsumer(socket, data, callback): Promise<any> {
    const { consumerId } = data,
        consumer = MediaStreamSystem.instance?.consumers.find(c => c.id === consumerId);
    if (consumer != null) {
        logger.info("pause-consumer", consumer.appData);
        await consumer.pause();
    }
    callback({ paused: true });
}

export async function handleWebRtcResumeConsumer(socket, data, callback): Promise<any> {
    const { consumerId } = data,
        consumer = MediaStreamSystem.instance?.consumers.find(c => c.id === consumerId);
    if (consumer != null) {
        logger.info("resume-consumer", consumer.appData);
        await consumer.resume();
    }
    callback({ resumed: true });
}

export async function handleWebRtcCloseConsumer(socket, data, callback): Promise<any> {
    const { consumerId } = data,
        consumer = MediaStreamSystem.instance?.consumers.find(c => c.id === consumerId);
    logger.info(`Close Consumer handler: ${consumerId}`);
    if (consumer != null) await closeConsumer(consumer);
    callback({ closed: true });
}

export async function handleWebRtcConsumerSetLayers(socket, data, callback): Promise<any> {
    const { consumerId, spatialLayer } = data,
        consumer = MediaStreamSystem.instance?.consumers.find(c => c.id === consumerId);
    logger.info("consumer-set-layers: ", spatialLayer, consumer.appData);
    await consumer.setPreferredLayers({ spatialLayer });
    callback({ layersSet: true });
}

export async function handleWebRtcResumeProducer(socket, data, callback): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    const { producerId } = data,
        producer = MediaStreamSystem.instance?.producers.find(p => p.id === producerId);
    logger.info("resume-producer", producer.appData);
    console.log('Resume-producer for user ' + userId);
    await producer.resume();
    if (userId != null && Network.instance.clients[userId] != null) {
        Network.instance.clients[userId].media[producer.appData.mediaTag].paused = false;
        Network.instance.clients[userId].media[producer.appData.mediaTag].globalMute = false;
        const hostClient = Object.entries(Network.instance.clients).find(([name, client]) => {
            return client.media[producer.appData.mediaTag]?.producerId === producerId;
        });
        hostClient[1].socket.emit(MessageTypes.WebRTCResumeProducer.toString(), producer.id);
    }
    callback({ resumed: true });
}

export async function handleWebRtcPauseProducer(socket, data, callback): Promise<any> {
    const userId = getUserIdFromSocketId(socket.id);
    const { producerId, globalMute } = data,
        producer = MediaStreamSystem.instance?.producers.find(p => p.id === producerId);
    await producer.pause();
    console.log('Pause-producer for user ' + userId);
    if (userId != null && Network.instance.clients[userId] != null) {
        Network.instance.clients[userId].media[producer.appData.mediaTag].paused = true;
        Network.instance.clients[userId].media[producer.appData.mediaTag].globalMute = globalMute || false;
        if (globalMute === true) {
            const hostClient = Object.entries(Network.instance.clients).find(([name, client]) => {
                return client.media[producer.appData.mediaTag]?.producerId === producerId;
            });
            hostClient[1].socket.emit(MessageTypes.WebRTCPauseProducer.toString(), producer.id, true);
        }
    }
    callback({ paused: true });
}

export async function handleWebRtcRequestCurrentProducers(socket, data, callback): Promise<any> {
    const { channelType, channelId } = data;

    await sendInitialProducers(socket, channelType, channelId);
    callback({requested: true});
}