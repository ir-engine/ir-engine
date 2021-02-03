import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { CAM_VIDEO_SIMULCAST_ENCODINGS } from "@xr3ngine/engine/src/networking/constants/VideoConstants";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { UnreliableMessageType } from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import { DataProducer, Transport as MediaSoupTransport } from "mediasoup-client/lib/types";

let networkTransport: any;

export async function createDataProducer(channel = "default", type: UnreliableMessageType = 'raw', customInitInfo: any = {}): Promise<DataProducer | Error> {
    networkTransport = Network.instance.transport as any;
    // else if (MediaStreamComponent.instance.dataProducers.get(channel)) return Promise.reject(new Error('Data channel already exists!'))
    const dataProducer = await networkTransport.instanceSendTransport.produceData({
        appData: { data: customInitInfo },
        ordered: false,
        label: channel,
        maxPacketLifeTime: 3000,
        // maxRetransmits: 3,
        protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
    });
    // dataProducer.on("open", () => {
    //     networkTransport.dataProducer.send(JSON.stringify({ info: 'init' }));
    // });
    dataProducer.on("transportclose", () => {
        MediaStreamComponent.instance.dataProducers.delete(channel);
        networkTransport.dataProducer.close();
    });
    networkTransport.dataProducer = dataProducer;
    MediaStreamComponent.instance.dataProducers.set(channel, networkTransport.dataProducer);
    return Promise.resolve(networkTransport.dataProducer);
}

export async function initReceiveTransport(relationshipType: string, relationshipId?: string): Promise<MediaSoupTransport | Error> {
    networkTransport = Network.instance.transport as any;
    let newTransport;
    if (relationshipType === 'instance')
        newTransport = networkTransport.instanceRecvTransport = await createTransport('recv', relationshipType);
    else
        newTransport = networkTransport.relRecvTransport = await createTransport('recv', relationshipType, relationshipId);
    return Promise.resolve(newTransport);
}

export async function initSendTransport(relationshipType: string, relationshipId?: string): Promise<MediaSoupTransport | Error> {
    networkTransport = Network.instance.transport as any;
    let newTransport;
    if (relationshipType === 'instance')
        newTransport = networkTransport.instanceSendTransport = await createTransport('send', relationshipType);
    else
        newTransport = networkTransport.relSendTransport = await createTransport('send', relationshipType, relationshipId);

    return Promise.resolve(newTransport);
}

export async function configureMediaTransports(relationshipType, relationshipId?: string): Promise<void> {
    networkTransport = Network.instance.transport as any;

    if (MediaStreamComponent.instance.mediaStream == null)
        await MediaStreamSystem.instance.startCamera();

    if (MediaStreamComponent.instance.mediaStream == null)
        console.warn("Media stream is null, camera must have failed");

    if (relationshipType !== 'instance' && (networkTransport.relSendTransport == null || networkTransport.relSendTransport.closed === true || networkTransport.relSendTransport.connectionState === 'disconnected'))
        await Promise.all([initSendTransport(relationshipType, relationshipId), initReceiveTransport(relationshipType, relationshipId)]);
}

export async function createCamVideoProducer(relationshipType: string, relationshipId?: string): Promise<void> {
    if (MediaStreamComponent.instance.mediaStream !== null && networkTransport.videoEnabled === true) {
        const transport = relationshipType === 'instance' ? networkTransport.instanceSendTransport : networkTransport.relSendTransport;
        MediaStreamComponent.instance.camVideoProducer = await transport.produce({
            track: MediaStreamComponent.instance.mediaStream.getVideoTracks()[0],
            encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
            appData: { mediaTag: "cam-video", relationshipType: relationshipType, relationshipId: relationshipId }
        });

        if (MediaStreamComponent.instance.videoPaused) await MediaStreamComponent.instance.camVideoProducer.pause();
    }
}

export async function createCamAudioProducer(relationshipType: string, relationshipId?: string): Promise<void> {
    if (MediaStreamComponent.instance.mediaStream !== null) {
        //To control the producer audio volume, we need to clone the audio track and connect a Gain to it.
        //This Gain is saved on MediaStreamComponent so it can be accessed from the user's component and controlled.
        const audioTrack = MediaStreamComponent.instance.mediaStream.getAudioTracks()[0];
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
        const dst = ctx.createMediaStreamDestination();
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        [src, gainNode, dst].reduce((a, b) => a && (a.connect(b) as any));
        MediaStreamComponent.instance.audioGainNode = gainNode;
        MediaStreamComponent.instance.mediaStream.removeTrack(audioTrack);
        MediaStreamComponent.instance.mediaStream.addTrack(dst.stream.getAudioTracks()[0]);
        // same thing for audio, but we can use our already-created
        const transport = relationshipType === 'instance' ? networkTransport.instanceSendTransport : networkTransport.relSendTransport;

        // Create a new transport for audio and start producing
        MediaStreamComponent.instance.camAudioProducer = await transport.produce({
            track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
            appData: { mediaTag: "cam-audio", relationshipType: relationshipType, relationshipId: relationshipId }
        });

        if (MediaStreamComponent.instance.audioPaused) MediaStreamComponent.instance.camAudioProducer.pause();
    }
}

export async function endVideoChat(options: { leftParty?: boolean, endConsumers?: boolean }): Promise<boolean> {
    networkTransport = Network.instance.transport as any;

    try {
        if (MediaStreamComponent.instance?.camVideoProducer) {
            if (networkTransport.socket?.connected === true)
                await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.camVideoProducer.id
                });
            await MediaStreamComponent.instance.camVideoProducer?.close();
        }

        if (MediaStreamComponent.instance?.camAudioProducer) {
            if (networkTransport.socket?.connected === true)
                await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.camAudioProducer.id
                });
            await MediaStreamComponent.instance.camAudioProducer?.close();
        }

        if (MediaStreamComponent.instance?.screenVideoProducer) {
            if (networkTransport.socket?.connected === true)
                await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.screenVideoProducer.id
                });
            await MediaStreamComponent.instance.screenVideoProducer?.close();
        }
        if (MediaStreamComponent.instance?.screenAudioProducer) {
            if (networkTransport.socket?.connected === true)
                await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.screenAudioProducer.id
                });
            await MediaStreamComponent.instance.screenAudioProducer?.close();
        }

        if (options?.endConsumers === true) {
            MediaStreamComponent.instance?.consumers.map(async (c) => {
                if (networkTransport.socket?.connected === true)
                    await networkTransport.request(MessageTypes.WebRTCCloseConsumer.toString(), {
                        consumerId: c.id
                    });
                await c.close();
            });
        }

        if (options?.leftParty === true) {
            if (networkTransport.relRecvTransport != null && networkTransport.relRecvTransport.closed !== true)
                await networkTransport.relRecvTransport.close();
            if (networkTransport.relSendTransport != null && networkTransport.relSendTransport.closed !== true)
                await networkTransport.relSendTransport.close();
        }

        resetProducer();
        return true;
    } catch (err) {
        console.log('EndvideoChat error');
        console.log(err);
    }
}

export function resetProducer(): void {
    if (MediaStreamComponent.instance) {
        MediaStreamComponent.instance.camVideoProducer = null;
        MediaStreamComponent.instance.camAudioProducer = null;
        MediaStreamComponent.instance.screenVideoProducer = null;
        MediaStreamComponent.instance.screenAudioProducer = null;
        MediaStreamComponent.instance.mediaStream = null;
        MediaStreamComponent.instance.localScreen = null;
        // MediaStreamComponent.instance.consumers = [];
    }
}

export function setRelationship(relationshipType: string, relationshipId: string): void {
    networkTransport = Network.instance.transport as any;
    networkTransport.relationshipType = relationshipType;
    networkTransport.relationshipId = relationshipId;
}

export async function subscribeToTrack(peerId: string, mediaTag: string, relationshipType: string, relationshipId: string) {
    console.log('subscribeToTrack');
    console.log(peerId);
    console.log(mediaTag);
    console.log(relationshipType);
    console.log(relationshipId);
    networkTransport = Network.instance.transport as any;

    // if we do already have a consumer, we shouldn't have called this method
    let consumer = MediaStreamComponent.instance.consumers.find
        ((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag);

    // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
    const consumerParameters = await networkTransport.request(MessageTypes.WebRTCReceiveTrack.toString(),
        { mediaTag, mediaPeerId: peerId, rtpCapabilities: networkTransport.mediasoupDevice.rtpCapabilities, relationshipType: relationshipType, relationshipId: relationshipId }
    );

    // Only continue if we have a valid id
    if (consumerParameters?.id == null) return;

    consumer = relationshipType === 'instance' ?
        await networkTransport.instanceRecvTransport.consume({ ...consumerParameters, appData: { peerId, mediaTag, relationshipType }, paused: true })
        : await networkTransport.relRecvTransport.consume({ ...consumerParameters, appData: { peerId, mediaTag, relationshipType, relationshipId }, paused: true });

    if (MediaStreamComponent.instance.consumers?.find(c => c?.appData?.peerId === peerId && c?.appData?.mediaTag === mediaTag) == null) {
        MediaStreamComponent.instance.consumers.push(consumer);

        // okay, we're ready. let's ask the peer to send us media
        await resumeConsumer(consumer);
    }
    else await closeConsumer(consumer);
}

export async function unsubscribeFromTrack(peerId: any, mediaTag: any) {
    const consumer = MediaStreamComponent.instance.consumers.find(
        c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
    );
    await closeConsumer(consumer);
}

export async function pauseConsumer(consumer: { appData: { peerId: any; mediaTag: any; }; id: any; pause: () => any; }) {
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCPauseConsumer.toString(), { consumerId: consumer.id });
    await consumer.pause();
}

export async function resumeConsumer(consumer: { appData: { peerId: any; mediaTag: any; }; id: any; resume: () => any; }) {
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCResumeConsumer.toString(), { consumerId: consumer.id });
    await consumer.resume();
}

export async function pauseProducer(producer: { appData: { mediaTag: any; }; id: any; pause: () => any; }) {
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCPauseProducer.toString(), { producerId: producer.id });
    await producer.pause();
}

export async function globalMuteProducer(producer: { id: any; }) {
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCPauseProducer.toString(), { producerId: producer.id, globalMute: true });
}

export async function resumeProducer(producer: { appData: { mediaTag: any; }; id: any; resume: () => any; }) {
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCResumeProducer.toString(), { producerId: producer.id });
    await producer.resume();
}

export async function globalUnmuteProducer(producer: { id: any; }) {
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCResumeProducer.toString(), { producerId: producer.id });
}

export async function closeConsumer(consumer: any) {
    // tell the server we're closing this consumer. (the server-side
    // consumer may have been closed already, but that's okay.)
    networkTransport = Network.instance.transport as any;
    await networkTransport.request(MessageTypes.WebRTCCloseConsumer.toString(), { consumerId: consumer.id });
    await consumer.close();

    const filteredConsumers = MediaStreamComponent.instance.consumers.filter(
        (c: any) => !(c.id === consumer.id)
    ) as any[];
    MediaStreamComponent.instance.consumers = filteredConsumers;
}
// utility function to create a transport and hook up signaling logic
// appropriate to the transport's direction

export async function createTransport(direction: string, relationshipType?: string, relationshipId?: string) {
    networkTransport = Network.instance.transport as any;

    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport;
    const { transportOptions } = await networkTransport.request(MessageTypes.WebRTCTransportCreate.toString(), { direction, sctpCapabilities: networkTransport.mediasoupDevice.sctpCapabilities, relationshipType: relationshipType, relationshipId: relationshipId });

    if (direction === "recv")
        transport = await networkTransport.mediasoupDevice.createRecvTransport(transportOptions);
    else if (direction === "send")
        transport = await networkTransport.mediasoupDevice.createSendTransport(transportOptions);
    else
        throw new Error(`bad transport 'direction': ${direction}`);

    // mediasoup-client will emit a connect event when media needs to
    // start flowing for the first time. send dtlsParameters to the
    // server, then call callback() on success or errback() on failure.
    transport.on("connect", async ({ dtlsParameters }: any, callback: () => void, errback: () => void) => {
        const connectResult = await networkTransport.request(MessageTypes.WebRTCTransportConnect.toString(),
            { transportId: transportOptions.id, dtlsParameters });

        if (connectResult.error) {
            console.log('Transport connect error');
            console.log(connectResult.error);
            return errback();
        }

        callback();
    });

    if (direction === "send") {
        // sending transports will emit a produce event when a new track
        // needs to be set up to start sending. the producer's appData is
        // passed as a parameter
        transport.on("produce",
            async ({ kind, rtpParameters, appData }: any, callback: (arg0: { id: any; }) => void, errback: () => void) => {

                // we may want to start out paused (if the checkboxes in the ui
                // aren't checked, for each media type. not very clean code, here
                // but, you know, this isn't a real application.)
                let paused = false;
                if (appData.mediaTag === "cam-video")
                    paused = MediaStreamComponent.instance.videoPaused;
                else if (appData.mediaTag === "cam-audio")
                    paused = MediaStreamComponent.instance.audioPaused;

                // tell the server what it needs to know from us in order to set
                // up a server-side producer object, and get back a
                // producer.id. call callback() on success or errback() on
                // failure.
                const { error, id } = await networkTransport.request(MessageTypes.WebRTCSendTrack.toString(), {
                    transportId: transportOptions.id,
                    kind,
                    rtpParameters,
                    paused,
                    appData
                });
                if (error) {
                    errback();
                    console.log(error);
                    return;
                }
                callback({ id });
            });

        transport.on("producedata",
            async (parameters: any, callback: (arg0: { id: any; }) => void, errback: () => void) => {
                const { sctpStreamParameters, label, protocol, appData } = parameters;
                const { error, id } = await networkTransport.request(MessageTypes.WebRTCProduceData, {
                    transportId: transport.id,
                    sctpStreamParameters,
                    label,
                    protocol,
                    appData
                });

                if (error) {
                    console.log(error);
                    errback();
                    return;
                }

                return callback({ id });
            }
        );
    }

    // any time a transport transitions to closed,
    // failed, or disconnected, leave the  and reset
    transport.on("connectionstatechange", async (state: string) => {
        if (networkTransport.leaving !== true && (state === "closed" || state === "failed" || state === "disconnected")) {
            await networkTransport.request(MessageTypes.WebRTCTransportClose.toString(), { transportId: transport.id });
        }
        if (networkTransport.leaving !== true && state === 'connected' && transport.direction === 'recv') {
            await networkTransport.request(MessageTypes.WebRTCRequestCurrentProducers.toString(), { relationshipType: relationshipType, relationshipId: relationshipId });
        }
    });

    transport.relationshipType = relationshipType;
    transport.relationshipId = relationshipId;
    return Promise.resolve(transport);
}

export async function leave(): Promise<boolean> {
    networkTransport = Network.instance.transport as any;
    try {
        networkTransport.leaving = true;

        if (networkTransport.request) {
            // close everything on the server-side (transports, producers, consumers)
            const result = await networkTransport.request(MessageTypes.LeaveWorld.toString());
            if (result.error) console.error(result.error);
        }

        networkTransport.leaving = false;

        //Leaving the world should close all transports from the server side.
        //This will also destroy all the associated producers and consumers.
        //All we need to do on the client is null all references.
        networkTransport.instanceRecvTransport = null;
        networkTransport.instanceSendTransport = null;
        networkTransport.relRecvTransport = null;
        networkTransport.relSendTransport = null;
        networkTransport.lastPollSyncData = {};
        if (MediaStreamComponent.instance) {
            MediaStreamComponent.instance.camVideoProducer = null;
            MediaStreamComponent.instance.camAudioProducer = null;
            MediaStreamComponent.instance.screenVideoProducer = null;
            MediaStreamComponent.instance.screenAudioProducer = null;
            MediaStreamComponent.instance.mediaStream = null;
            MediaStreamComponent.instance.localScreen = null;
            MediaStreamComponent.instance.consumers = [];
        }

        if (networkTransport.socket && networkTransport.socket.close)
            networkTransport.socket.close();

        return true;
    } catch (err) {
        console.log('Error with leave()');
        console.log(err);
        networkTransport.leaving = false;
    }
}

// async startScreenshare(): Promise<boolean> {
//   console.log("start screen share");
//
//   // make sure we've joined the  and that we have a sending transport
//   if (!transport.sendTransport) transport.sendTransport = await transport.createTransport("send");
//
//   // get a screen share track
//   MediaStreamComponent.instance.localScreen = await (navigator.mediaDevices as any).getDisplayMedia(
//     { video: true, audio: true }
//   );
//
//   // create a producer for video
//   MediaStreamComponent.instance.screenVideoProducer = await transport.sendTransport.produce({
//     track: MediaStreamComponent.instance.localScreen.getVideoTracks()[0],
//     encodings: [], // TODO: Add me
//     appData: { mediaTag: "screen-video" }
//   });
//
//   // create a producer for audio, if we have it
//   if (MediaStreamComponent.instance.localScreen.getAudioTracks().length) {
//     MediaStreamComponent.instance.screenAudioProducer = await transport.sendTransport.produce({
//       track: MediaStreamComponent.instance.localScreen.getAudioTracks()[0],
//       appData: { mediaTag: "screen-audio" }
//     });
//   }
//
//   // handler for screen share stopped event (triggered by the
//   // browser's built-in screen sharing ui)
//   MediaStreamComponent.instance.screenVideoProducer.track.onended = async () => {
//     console.log("screen share stopped");
//     await MediaStreamComponent.instance.screenVideoProducer.pause();
//
//     const { error } = await transport.request(MessageTypes.WebRTCCloseProducer.toString(), {
//       producerId: MediaStreamComponent.instance.screenVideoProducer.id
//     });
//
//     await MediaStreamComponent.instance.screenVideoProducer.close();
//     MediaStreamComponent.instance.screenVideoProducer = null;
//     if (MediaStreamComponent.instance.screenAudioProducer) {
//       const { error: screenAudioProducerError } = await transport.request(MessageTypes.WebRTCCloseProducer.toString(), {
//         producerId: MediaStreamComponent.instance.screenAudioProducer.id
//       });
//
//       await MediaStreamComponent.instance.screenAudioProducer.close();
//       MediaStreamComponent.instance.screenAudioProducer = null;
//     }
//   };
//   return true;
// }