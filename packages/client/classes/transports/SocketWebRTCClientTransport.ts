import { User } from "@xr3ngine/common/interfaces/User";
import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { CAM_VIDEO_SIMULCAST_ENCODINGS } from "@xr3ngine/engine/src/networking/constants/VideoConstants";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { applyNetworkStateToClient } from "@xr3ngine/engine/src/networking/functions/applyNetworkStateToClient";
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { UnreliableMessageReturn, UnreliableMessageType } from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import * as mediasoupClient from "mediasoup-client";
import { DataConsumerOptions, DataProducer, Transport as MediaSoupTransport } from "mediasoup-client/lib/types";
import getConfig from "next/config";
import ioclient from "socket.io-client";
import store from "../../redux/store";


const { publicRuntimeConfig } = getConfig();
const gameserver = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.gameserver : 'https://localhost:3030';

const Device = mediasoupClient.Device;

const DEFAULT_DATA_CHANNEL = 'default';

export class SocketWebRTCClientTransport implements NetworkTransport {
  isServer = false
  mediasoupDevice: mediasoupClient.Device
  leaving = false
  instanceRecvTransport: MediaSoupTransport
  instanceSendTransport: MediaSoupTransport
  partyRecvTransport: MediaSoupTransport
  partySendTransport: MediaSoupTransport
  lastPollSyncData = {}
  pollingTickRate = 1000
  pollingTimeout = 4000

  socket: SocketIOClient.Socket = {} as SocketIOClient.Socket

  request: any
  localScreen: any;
  lastPoll: Date;
  pollPending = false;
  videoEnabled = false;

  partyId: string;

    /**
   * Send a message over TCP with socket.io
   * You should probably want {@link @xr3ngine/packages/enginge/src/networking/functions/NetworkFunctions.ts#sendMessage}
   * @param message message to send
   */
  sendReliableData(message): void {
    this.socket.emit(MessageTypes.ReliableMessage.toString(), message);
  }

  handleKick(socket){
    console.log("Handling kick: ", socket);
  }

  // send and init are done separately to make it a bit more readable
  // sendTransport should be available before initializing data channel
  // creates data producer on client
  async createDataProducer(channel: string = DEFAULT_DATA_CHANNEL, type: UnreliableMessageType = 'raw', customInitInfo: any = {}): Promise<DataProducer | Error> {
    // else if (MediaStreamComponent.instance.dataProducers.get(channel)) return Promise.reject(new Error('Data channel already exists!'))
    const dataProducer = await this.instanceSendTransport.produceData({
      appData: { data: customInitInfo }, // Probably Add additional info to send to server
      ordered: true,
      label: channel,
      maxPacketLifeTime: 3000,
      // maxRetransmits: 3,
      protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
    });
    console.log('data producer created on client!');
    dataProducer.on("open", () => {
      console.log(`Data channel: '${dataProducer.label}' open...`);
      dataProducer.send(JSON.stringify({ info: 'init' }));
    });
    dataProducer.on("transportclose", () => {
      MediaStreamComponent.instance.dataProducers.delete(channel);
      dataProducer.close();
    });
    console.log("Setting data producer");
    MediaStreamComponent.instance.dataProducers.set(channel, dataProducer);
    return Promise.resolve(dataProducer);
  }

  // Create data consumer and subscribe to the other client's producer when signalled
  handleDataConsumerCreation = async (options: DataConsumerOptions) => {
    console.log("Data consumer creation");
    const dataConsumer = await this.instanceRecvTransport.consumeData(options);
    console.log("Data consumer created");
   

    dataConsumer.on('message', (dataConsumer)  => (message: any)  => {
      Network.instance.incomingMessageQueue.add(message);
    }); // Handle message received
    console.log("Setting data consumer");
    MediaStreamComponent.instance.dataConsumers.set(options.dataProducerId, dataConsumer);
    dataConsumer.on('close', () => {
      dataConsumer.close();
      MediaStreamComponent.instance.dataConsumers.delete(options.dataProducerId);
    }); // Handle message received
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  async sendData(data: any, channel: string = DEFAULT_DATA_CHANNEL): Promise<UnreliableMessageReturn> {
    const dataProducer: DataProducer | undefined = MediaStreamComponent.instance.dataProducers.get(channel);
    if (!dataProducer) throw new Error('Data Channel not initialized on client, Data Producer doesn\'t exist!');
    console.log("Sending data on data channel: ", channel);
    dataProducer.send(data);
    return Promise.resolve(dataProducer);
  }

  // Adds support for Promise to socket.io-client
  promisedRequest(socket: SocketIOClient.Socket) {
    return function request(type: any, data = {}): any {
      return new Promise(resolve => socket.emit(type, data, resolve));
    };
  }

  public async initialize(address = "https://127.0.0.1", port = 3030, opts?: any): Promise<void> {
    console.log(`Initializing client transport to ${address}:${port} with partyId: ${opts.partyId}`);

    const token = (store.getState() as any).get('auth').get('authUser').accessToken;
    const selfUser = (store.getState() as any).get('auth').get('user') as User;

    Network.instance.userId = selfUser.id;
    Network.instance.accessToken = token;

    this.mediasoupDevice = new Device();
    if (this.socket && this.socket.close) {
      this.socket.close();
    }

    const {startVideo, videoEnabled, partyId, ...query} = opts;
    this.partyId = partyId;

    this.videoEnabled = videoEnabled ?? false;

    if (process.env.NODE_ENV === 'development') {
      this.socket = ioclient(`${address as string}:${port.toString()}/realtime`, {
        query: query
      });
    } else {
      this.socket = ioclient(`${gameserver}/realtime`, {
        path: `/socket.io/${address as string}/${port.toString()}`,
        query: query
      });
    }
    this.request = this.promisedRequest(this.socket);

    // window.screenshare = await this.startScreensharea

    console.log(`Initializing socket.io...,`);
    this.socket.on("connect", async () => {
      const payload = { userId: Network.instance.userId, accessToken: Network.instance.accessToken};
      const { success } = await this.request(MessageTypes.Authorization.toString(), payload);

      if(!success) return console.error("Unable to connect with credentials");
      
          // signal that we're a new peer and initialize our
    // mediasoup-client device, if this is our first time connecting

    console.log("Joining world");
    const joinWorldResponse = await this.request(MessageTypes.JoinWorld.toString());

    const { worldState, routerRtpCapabilities } = joinWorldResponse as any;

    // TODO: This shouldn't be in the transport, should be in our network system somehow
    // Apply all state to initial frame
    applyNetworkStateToClient(worldState);

    if (this.mediasoupDevice.loaded !== true) await this.mediasoupDevice.load({ routerRtpCapabilities });

    console.log("Joined world");
    // return Promise.resolve();

      // Send heartbeat every second
      setInterval(() => {
        this.socket.emit(MessageTypes.Heartbeat.toString());
        console.log("Sending heartbeat");
      }, 1000);

      Network.instance.socketId = this.socket.id;

      // If a reliable message is received, add it to the queue
      this.socket.on(MessageTypes.ReliableMessage.toString(), (message) => {
        Network.instance?.incomingMessageQueue.add(message);
      });

      // use sendBeacon to tell the server we're disconnecting when
      // the page unloads
      window.addEventListener("unload", async () => {
        this.socket.emit(MessageTypes.LeaveWorld.toString());
      });

      // Ping request for testing unreliable messaging may remove if not needed
      console.log('About to init receive and send transports');
      // Init Receive and Send Transports initially since we need them for unreliable message consumption and production
      await Promise.all([this.initSendTransport('instance'), this.initReceiveTransport('instance')]);

      await this.createDataProducer();

      console.log('Data Producer created');
      // await this.sendCameraStreams();
      if (startVideo === true) this.sendCameraStreams(partyId);
    });
    this.socket.on('disconnect', async () => {
      console.log('Socket received disconnect');
      // this.socket.close();
    });
    this.socket.on(MessageTypes.Kick.toString(), async () => {
      console.log("TODO: SNACKBAR HERE");
      console.log('Socket received kick message');
      this.socket.close();
    });
    this.socket.on(MessageTypes.WebRTCConsumeData.toString(), this.handleDataConsumerCreation);
    this.socket.on(MessageTypes.WebRTCCreateProducer.toString(), async (socketId, mediaTag, producerId, localPartyId) => {
      const selfProducerIds = [
          MediaStreamComponent.instance.camVideoProducer?.id,
          MediaStreamComponent.instance.camAudioProducer?.id
      ];
      if (
          (MediaStreamComponent.instance.mediaStream !== null) &&
          (producerId != null) &&
          (selfProducerIds.indexOf(producerId) < 0) &&
          (MediaStreamComponent.instance.consumers?.find(
              c => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag
          ) == null &&
          (this.partyId === localPartyId) || localPartyId === 'instance')
      ) {
        // that we don't already have consumers for...
        console.log(`auto subscribing to ${mediaTag} track that ${socketId} has added at ${new Date()}`);
        await this.subscribeToTrack(socketId, mediaTag, localPartyId);
      }
    });

    this.socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async(consumerId) => {
      if (MediaStreamComponent.instance) MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter((c) => c.id !== consumerId);
    });
  }

  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
  // Mediasoup Code:
  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//


  // Init receive transport, create one if it doesn't exist else just resolve promise
  async initReceiveTransport(partyId?: string): Promise<MediaSoupTransport | Error> {
    console.log('Creating receive transport');
    let transport;
    if (partyId === 'instance') transport = this.instanceRecvTransport = await this.createTransport('recv', 'instance');
    else transport = this.partyRecvTransport = await this.createTransport('recv', partyId);
    return Promise.resolve(transport);
  }

  // Init send transport, create one if it doesn't exist else just resolve promise
  async initSendTransport(partyId?: string): Promise<MediaSoupTransport | Error> {
    console.log('Creating send transport');
    let transport;
    if (partyId === 'instance') transport = this.instanceSendTransport = await this.createTransport('send', 'instance');
    else transport = this.partySendTransport = await this.createTransport('send', partyId);
    return Promise.resolve(transport);
  }

  async sendCameraStreams(partyId?: string): Promise<void> {
    console.log("send camera streams");
    // start sending video. the transport logic will initiate a
    // signaling conversation with the server to set up an outbound rtp
    // stream for the camera video track. our createTransport() function
    // includes logic to tell the server to start the stream in a paused
    // state, if the checkbox in our UI is unchecked. so as soon as we
    // have a client-side camVideoProducer object, we need to set it to
    // paused as appropriate, too.
    if (MediaStreamComponent.instance.mediaStream == null) await MediaStreamSystem.instance.startCamera();
    if (this.videoEnabled === true) {
      console.log('Video track to send:');
      console.log(MediaStreamComponent.instance.mediaStream.getVideoTracks()[0]);
      let transport;
      if (partyId === 'instance') {
        transport = this.instanceSendTransport;
      } else {
        if (this.partySendTransport == null || this.partySendTransport.closed === true) [transport,] = await Promise.all([this.initSendTransport(partyId), this.initReceiveTransport(partyId)]);
        else transport = this.partySendTransport;
      }
      MediaStreamComponent.instance.camVideoProducer = await transport.produce({
        track: MediaStreamComponent.instance.mediaStream.getVideoTracks()[0],
        encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
        appData: {mediaTag: "cam-video", partyId: partyId}
      });

      if (MediaStreamComponent.instance.videoPaused) await MediaStreamComponent.instance.camVideoProducer.pause();
    }

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
    const transport = partyId === 'instance' ? this.instanceSendTransport : this.partySendTransport;
    MediaStreamComponent.instance.camAudioProducer = await transport.produce({
      track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
      appData: { mediaTag: "cam-audio", partyId: partyId }
    });

    if (MediaStreamComponent.instance.audioPaused) MediaStreamComponent.instance.camAudioProducer.pause();
  }

  // async startScreenshare(): Promise<boolean> {
  //   console.log("start screen share");
  //
  //   // make sure we've joined the  and that we have a sending transport
  //   if (!this.sendTransport) this.sendTransport = await this.createTransport("send");
  //
  //   // get a screen share track
  //   MediaStreamComponent.instance.localScreen = await (navigator.mediaDevices as any).getDisplayMedia(
  //     { video: true, audio: true }
  //   );
  //
  //   // create a producer for video
  //   MediaStreamComponent.instance.screenVideoProducer = await this.sendTransport.produce({
  //     track: MediaStreamComponent.instance.localScreen.getVideoTracks()[0],
  //     encodings: [], // TODO: Add me
  //     appData: { mediaTag: "screen-video" }
  //   });
  //
  //   // create a producer for audio, if we have it
  //   if (MediaStreamComponent.instance.localScreen.getAudioTracks().length) {
  //     MediaStreamComponent.instance.screenAudioProducer = await this.sendTransport.produce({
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
  //     const { error } = await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
  //       producerId: MediaStreamComponent.instance.screenVideoProducer.id
  //     });
  //
  //     await MediaStreamComponent.instance.screenVideoProducer.close();
  //     MediaStreamComponent.instance.screenVideoProducer = null;
  //     if (MediaStreamComponent.instance.screenAudioProducer) {
  //       const { error: screenAudioProducerError } = await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
  //         producerId: MediaStreamComponent.instance.screenAudioProducer.id
  //       });
  //
  //       await MediaStreamComponent.instance.screenAudioProducer.close();
  //       MediaStreamComponent.instance.screenAudioProducer = null;
  //     }
  //   };
  //   return true;
  // }

  async endVideoChat(leftParty?: boolean): Promise<boolean> {
    if (MediaStreamComponent.instance?.camVideoProducer) {
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.camVideoProducer.id
      });
      await MediaStreamComponent.instance.camVideoProducer?.close();
    }
    if (MediaStreamComponent.instance?.camAudioProducer) {
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.camAudioProducer.id
      });
      await MediaStreamComponent.instance.camAudioProducer?.close();
    }
    if (MediaStreamComponent.instance?.screenVideoProducer) {
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.screenVideoProducer.id
      });
      await MediaStreamComponent.instance.screenVideoProducer?.close();
    }
    if (MediaStreamComponent.instance?.screenAudioProducer) {
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.screenAudioProducer.id
      });
      await MediaStreamComponent.instance.screenAudioProducer?.close();
    }

    MediaStreamComponent.instance?.consumers.map(async (c) => {
      await this.request(MessageTypes.WebRTCCloseConsumer.toString(), {
        consumerId: c.id
      });
      await c.close();
    });
    if (leftParty === true) {
      if (this.partyRecvTransport != null && this.partyRecvTransport.closed !== true) await this.partyRecvTransport.close();
      if (this.partySendTransport != null && this.partySendTransport.closed !== true) await this.partySendTransport.close();
    }
    this.resetProducer();
    return true;
  }

  resetProducer(): void {
    if (MediaStreamComponent.instance) {
      MediaStreamComponent.instance.camVideoProducer = null;
      MediaStreamComponent.instance.camAudioProducer = null;
      MediaStreamComponent.instance.screenVideoProducer = null;
      MediaStreamComponent.instance.screenAudioProducer = null;
      MediaStreamComponent.instance.mediaStream = null;
      MediaStreamComponent.instance.localScreen = null;
      MediaStreamComponent.instance.consumers = [];
    }
  }

  setPartyId(partyId: string): void {
    this.partyId = partyId;
  }

  async leave(): Promise<boolean> {
    try {
      console.log('Attempting to leave client transport');
      this.leaving = true;

      if (this.request) {
        console.log('Leaving World');
        // close everything on the server-side (transports, producers, consumers)
        const result = await this.request(MessageTypes.LeaveWorld.toString());
        console.log('LeaveWorld result:');
        console.log(result);
        if (result.error) {
          console.error(result.error);
        }
        console.log('Left World');
      }

      //Leaving the world should close all transports from the server side.
      //This will also destroy all the associated producers and consumers.
      //All we need to do on the client is null all references.
      this.instanceRecvTransport = null;
      this.instanceSendTransport = null;
      this.partyRecvTransport = null;
      this.partySendTransport = null;
      this.lastPollSyncData = {};
      if (MediaStreamComponent.instance) {
        MediaStreamComponent.instance.camVideoProducer = null;
        MediaStreamComponent.instance.camAudioProducer = null;
        MediaStreamComponent.instance.screenVideoProducer = null;
        MediaStreamComponent.instance.screenAudioProducer = null;
        MediaStreamComponent.instance.mediaStream = null;
        MediaStreamComponent.instance.localScreen = null;
        MediaStreamComponent.instance.consumers = [];
      }
      if (this.socket && this.socket.close) {
        this.socket.close();
      }
      this.leaving = false;
      console.log('Nulled everything');
      return true;
    } catch (err) {
      console.log('Error with leave()');
      console.log(err);
      this.leaving = false;
    }
  }

  async subscribeToTrack(peerId: string, mediaTag: string, partyId) {
    // if we do already have a consumer, we shouldn't have called this method
    let consumer = MediaStreamComponent.instance.consumers.find(
      (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
    );

    // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
    const consumerParameters = await this.request(MessageTypes.WebRTCReceiveTrack.toString(),
      { mediaTag, mediaPeerId: peerId, rtpCapabilities: this.mediasoupDevice.rtpCapabilities, partyId: partyId }
    );

    console.log(`Requesting consumer for peer ${peerId} of type ${mediaTag} at ${new Date()}`);

    if (consumerParameters.id != null) {
      consumer = partyId === 'instance' ? await this.instanceRecvTransport.consume(
          {...consumerParameters, appData: {peerId, mediaTag}}
      ) : await this.partyRecvTransport.consume(
          {...consumerParameters, appData: {peerId, mediaTag, partyId}}
      );

      if (MediaStreamComponent.instance.consumers?.find(c => c?.appData?.peerId === peerId && c?.appData?.mediaTag === mediaTag) == null) {
        let connected = false;
        MediaStreamComponent.instance.consumers.push(consumer);

        connected = true;

        // okay, we're ready. let's ask the peer to send us media
        await this.resumeConsumer(consumer);
      } else {
        await this.closeConsumer(consumer);
      }
    }
  }

  async unsubscribeFromTrack(peerId: any, mediaTag: any) {
    const consumer = MediaStreamComponent.instance.consumers.find(
      c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
    );
    await this.closeConsumer(consumer);
  }

  public async pauseConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; pause: () => any }) {
    await this.request(MessageTypes.WebRTCPauseConsumer.toString(), { consumerId: consumer.id });
    await consumer.pause();
  }

  public async resumeConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; resume: () => any }) {
    await this.request(MessageTypes.WebRTCResumeConsumer.toString(), { consumerId: consumer.id });
    await consumer.resume();
  }

  async pauseProducer(producer: { appData: { mediaTag: any }; id: any; pause: () => any }) {
    await this.request(MessageTypes.WebRTCPauseProducer.toString(), { producerId: producer.id });
    await producer.pause();
  }

  async globalMuteProducer(producer: { id: any }) {
    await this.request(MessageTypes.WebRTCPauseProducer.toString(), { producerId: producer.id, globalMute: true });
  }

  async resumeProducer(producer: { appData: { mediaTag: any }; id: any; resume: () => any }) {
    await this.request(MessageTypes.WebRTCResumeProducer.toString(), { producerId: producer.id });
    await producer.resume();
  }

  async globalUnmuteProducer(producer: { id: any }) {
    await this.request(MessageTypes.WebRTCResumeProducer.toString(), { producerId: producer.id });
  }

  async closeConsumer(consumer: any) {
    console.log("closing consumer", consumer.appData.peerId, consumer.appData.mediaTag);
    // tell the server we're closing this consumer. (the server-side
    // consumer may have been closed already, but that's okay.)
    await this.request(MessageTypes.WebRTCCloseConsumer.toString(), { consumerId: consumer.id });
    await consumer.close();

    const filteredConsumers = MediaStreamComponent.instance.consumers.filter(
      (c: any) => !(c.id === consumer.id)
    ) as any[];
    MediaStreamComponent.instance.consumers = filteredConsumers;
  }

  // utility function to create a transport and hook up signaling logic
  // appropriate to the transport's direction
  async createTransport(direction: string, partyId?: string) {
    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport;
    const { transportOptions } = await this.request(MessageTypes.WebRTCTransportCreate.toString(), { direction, sctpCapabilities: this.mediasoupDevice.sctpCapabilities, partyId: partyId});

    if (direction === "recv")
      transport = await this.mediasoupDevice.createRecvTransport(transportOptions);
    else if (direction === "send")
      transport = await this.mediasoupDevice.createSendTransport(transportOptions);
    else
      throw new Error(`bad transport 'direction': ${direction}`);

    // mediasoup-client will emit a connect event when media needs to
    // start flowing for the first time. send dtlsParameters to the
    // server, then call callback() on success or errback() on failure.
    transport.on("connect", async ({ dtlsParameters }: any, callback: () => void, errback: () => void) => {
      console.log('Transport connected');
      const connectResult = await this.request(MessageTypes.WebRTCTransportConnect.toString(),
      { transportId: transportOptions.id, dtlsParameters }
      );
      console.log('Transport connect result:');
      console.log(connectResult);
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
      transport.on(
        "produce",
        async ({ kind, rtpParameters, appData }: any, callback: (arg0: { id: any }) => void, errback: () => void) => {
          console.log("transport produce event", appData.mediaTag);

          // we may want to start out paused (if the checkboxes in the ui
          // aren't checked, for each media type. not very clean code, here
          // but, you know, this isn't a real application.)
          let paused = false;
          if (appData.mediaTag === "cam-video") paused = MediaStreamComponent.instance.videoPaused;
          else if (appData.mediaTag === "cam-audio") paused = MediaStreamComponent.instance.audioPaused;

          // tell the server what it needs to know from us in order to set
          // up a server-side producer object, and get back a
          // producer.id. call callback() on success or errback() on
          // failure.
          const { error, id } = await this.request(MessageTypes.WebRTCSendTrack.toString(), {
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
        }
      );

      transport.on(
        "producedata",
        async (parameters: any, callback: (arg0: { id: any }) => void, errback: () => void) => {
          console.log("transport produce data event, params: ", parameters);
          const { sctpStreamParameters, label, protocol, appData } = parameters;
          const { error, id } = await this.request(MessageTypes.WebRTCProduceData, {
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
      console.log(`transport ${transport.id} connectionstatechange ${state}`);
      // for this simple sample code, assume that transports being
      // closed is an error (we never close these transports except when
      // we leave the )
      if (this.leaving !== true && (state === "closed" || state === "failed" || state === "disconnected")) {
        console.log("transport closed ... leaving the and resetting");
        // await this.request(MessageTypes.WebRTCTransportClose.toString(), { transportId: transport.id });
      }
    });


    return Promise.resolve(transport);
  }
}