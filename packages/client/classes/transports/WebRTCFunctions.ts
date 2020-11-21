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
    console.log("createDataProducer");
    // else if (MediaStreamComponent.instance.dataProducers.get(channel)) return Promise.reject(new Error('Data channel already exists!'))
    const dataProducer = await networkTransport.instanceSendTransport.produceData({
        appData: { data: customInitInfo },
        ordered: false,
        label: channel,
        maxPacketLifeTime: 3000,
        // maxRetransmits: 3,
        protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
    });
    console.log('data producer created on client!');
    dataProducer.on("open", () => {
        console.log(`Data channel: '${networkTransport.dataProducer.label}' open...`);
        networkTransport.dataProducer.send(JSON.stringify({ info: 'init' }));
    });
    dataProducer.on("transportclose", () => {
        MediaStreamComponent.instance.dataProducers.delete(channel);
        networkTransport.dataProducer.close();
    });
    console.log("Setting data producer");
    MediaStreamComponent.instance.dataProducers.set(channel, networkTransport.dataProducer);
    return Promise.resolve(networkTransport.dataProducer);
}

export async function initReceiveTransport(partyId?: string): Promise<MediaSoupTransport | Error> {
    console.log('Creating receive transport');
    console.log("party id is ", partyId);
    networkTransport = Network.instance.transport as any;
    let newTransport;
    if (partyId === 'instance')
        newTransport = networkTransport.instanceRecvTransport = await createTransport('recv', 'instance');
    else
        newTransport = networkTransport.partyRecvTransport = await createTransport('recv', partyId);
    return Promise.resolve(newTransport);
}

export async function initSendTransport(partyId?: string): Promise<MediaSoupTransport | Error> {
    console.log('Creating send transport');
    networkTransport = Network.instance.transport as any;
    let newTransport;
    if (partyId === 'instance')
        newTransport = networkTransport.instanceSendTransport = await createTransport('send', 'instance');
    else
        newTransport = networkTransport.partySendTransport = await createTransport('send', partyId);

    console.log("networkTransport.instanceSendTransport is", networkTransport.instanceSendTransport);
    return Promise.resolve(newTransport);
}

export async function sendCameraStreams(partyId?: string): Promise<void> {
    console.log("send camera streams");
    networkTransport = Network.instance.transport as any;

    if (MediaStreamComponent.instance.mediaStream == null)
        await MediaStreamSystem.instance.startCamera();

    if (MediaStreamComponent.instance.mediaStream == null || MediaStreamComponent.instance.mediaStream == undefined)
        console.warn("Media stream is null, camera must have failed");

    if (networkTransport.videoEnabled === true) {
        let newTransport;

        if (partyId === 'instance')
            newTransport = networkTransport.instanceSendTransport;
        else {
            if (networkTransport.partySendTransport == null || networkTransport.partySendTransport.closed === true || networkTransport.partySendTransport.connectionState === 'disconnected')
                [newTransport,] = await Promise.all([initSendTransport(partyId), initReceiveTransport(partyId)]);
            else
                newTransport = networkTransport.partySendTransport;
        }

        if (MediaStreamComponent.instance.mediaStream !== null) {
            MediaStreamComponent.instance.camVideoProducer = await newTransport.produce({
                track: MediaStreamComponent.instance.mediaStream.getVideoTracks()[0],
                encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
                appData: { mediaTag: "cam-video", partyId: partyId }
            });
    
            if (MediaStreamComponent.instance.videoPaused)
                await MediaStreamComponent.instance.camVideoProducer.pause();
        }
    }

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
        const newTransport = partyId === 'instance' ? networkTransport.instanceSendTransport : networkTransport.partySendTransport;

        // Create a new transport for audio and start producing
        MediaStreamComponent.instance.camAudioProducer = await newTransport.produce({
            track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
            appData: { mediaTag: "cam-audio", partyId: partyId }
        });

        if (MediaStreamComponent.instance.audioPaused)
            MediaStreamComponent.instance.camAudioProducer.pause();
    }
}

export async function endVideoChat(leftParty?: boolean): Promise<boolean> {
    console.log('Ending videochat');
    networkTransport = Network.instance.transport as any;

    try {
        if (MediaStreamComponent.instance?.camVideoProducer) {
            if (networkTransport.socket?.connected === true)
                await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.camVideoProducer.id
                });
            await MediaStreamComponent.instance.camVideoProducer?.close();
        }
        console.log('Closed cam video producer');

        if (MediaStreamComponent.instance?.camAudioProducer) {
            if (networkTransport.socket?.connected === true)
                await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
                    producerId: MediaStreamComponent.instance.camAudioProducer.id
                });
            await MediaStreamComponent.instance.camAudioProducer?.close();
        }
        console.log('Closed cam audio producer');

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
        console.log('Closed screen audio and video producers');

        // MediaStreamComponent.instance?.consumers.map(async (c) => {
        //     if (networkTransport.socket?.connected === true)
        //         await networkTransport.request(MessageTypes.WebRTCCloseConsumer.toString(), {
        //             consumerId: c.id
        //         });
        //     await c.close();
        // });
        // console.log('Closed all consumers');

        if (leftParty === true) {
            if (networkTransport.partyRecvTransport != null && networkTransport.partyRecvTransport.closed !== true)
                await networkTransport.partyRecvTransport.close();
            if (networkTransport.partySendTransport != null && networkTransport.partySendTransport.closed !== true)
                await networkTransport.partySendTransport.close();
        }

        resetProducer();
        console.log('Finished ending video chat');
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

export function setPartyId(partyId: string): void {
    networkTransport = Network.instance.transport as any;
    networkTransport.partyId = partyId;
}

export async function subscribeToTrack(peerId: string, mediaTag: string, partyId) {
    console.log("subscribeToTrack on peer", peerId, "for partyId", partyId);
    networkTransport = Network.instance.transport as any;

    // if we do already have a consumer, we shouldn't have called this method
    let consumer = MediaStreamComponent.instance.consumers.find
        ((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag);

    console.log('subscribeToTrack sending WebRTCReceiveTrack');
    // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
    const consumerParameters = await networkTransport.request(MessageTypes.WebRTCReceiveTrack.toString(),
        { mediaTag, mediaPeerId: peerId, rtpCapabilities: networkTransport.mediasoupDevice.rtpCapabilities, partyId: partyId }
    );

    console.log(`Requesting consumer for peer ${peerId} of type ${mediaTag} at ${new Date()}`);
    // Only continue if we have a valid id
    if (consumerParameters.id == null) return;

    consumer = partyId === 'instance' ?
        await networkTransport.instanceRecvTransport.consume({ ...consumerParameters, appData: { peerId, mediaTag }, paused: true })
        : await networkTransport.partyRecvTransport.consume({ ...consumerParameters, appData: { peerId, mediaTag, partyId }, paused: true });

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
    console.log(networkTransport);
    console.log(consumer);
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
    console.log("closing consumer", consumer.appData.peerId, consumer.appData.mediaTag);
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

export async function createTransport(direction: string, partyId?: string) {
    console.log("Creating a new transport for", partyId, "in the direction ", direction);
    networkTransport = Network.instance.transport as any;

    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport;
    const { transportOptions } = await networkTransport.request(MessageTypes.WebRTCTransportCreate.toString(), { direction, sctpCapabilities: networkTransport.mediasoupDevice.sctpCapabilities, partyId: partyId });

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

        console.log('Transport connected');
        callback();
    });

    if (direction === "send") {
        // sending transports will emit a produce event when a new track
        // needs to be set up to start sending. the producer's appData is
        // passed as a parameter
        transport.on("produce",
            async ({ kind, rtpParameters, appData }: any, callback: (arg0: { id: any; }) => void, errback: () => void) => {
                console.log("transport produce event", appData.mediaTag);

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
                console.log("transport produce data event, params: ", parameters);
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

                console.log("Transport produce data request successful");
                console.log(appData);
                return callback({ id });
            }
        );
    }

    // any time a transport transitions to closed,
    // failed, or disconnected, leave the  and reset
    transport.on("connectionstatechange", async (state: string) => {
        console.log(`transport ${transport.id} connectionstatechange ${state}`);
        if (networkTransport.leaving !== true && (state === "closed" || state === "failed" || state === "disconnected")) {
            console.log("transport closed ... leaving the and resetting");
            await networkTransport.request(MessageTypes.WebRTCTransportClose.toString(), { transportId: transport.id });
        }
    });

    return Promise.resolve(transport);
}

export async function leave(): Promise<boolean> {
    networkTransport = Network.instance.transport as any;
    try {
        console.log('Attempting to leave');
        networkTransport.leaving = true;

        if (networkTransport.request) {
            console.log('Leaving World');
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
        networkTransport.partyRecvTransport = null;
        networkTransport.partySendTransport = null;
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