import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { CAM_VIDEO_SIMULCAST_ENCODINGS } from "@xr3ngine/engine/src/networking/constants/VideoConstants";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { applyWorldState } from "@xr3ngine/engine/src/networking/functions/applyWorldState";
import handleDataChannelConsumerMessage from "@xr3ngine/engine/src/networking/functions/handleDataChannelConsumerMessage";
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { UnreliableMessageReturn, UnreliableMessageType } from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import * as mediasoupClient from "mediasoup-client";
import { DataConsumerOptions, DataProducer, Transport as MediaSoupTransport } from "mediasoup-client/lib/types";
import ioclient from "socket.io-client";

const Device = mediasoupClient.Device;

const DEFAULT_DATA_CHANNEL = 'default'

export class SocketWebRTCClientTransport implements NetworkTransport {
  isServer = false
  mediasoupDevice: mediasoupClient.Device
  leaving = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  lastPollSyncData = {}
  pollingInterval: NodeJS.Timeout
  pollingTickRate = 1000
  pollingTimeout = 4000

  socket: SocketIOClient.Socket = {} as SocketIOClient.Socket

  request: any
  localScreen: any;
  lastPoll: Date;
  pollPending = false;

    /**
   * Send a message over TCP with socket.io
   * You should probably want {@link @xr3ngine/packages/enginge/src/networking/functions/NetworkFunctions.ts#sendMessage}
   * @param message message to send
   */
  sendReliableData(message): void {
    this.socket.emit(message);
  }

  // send and init are done separately to make it a bit more readable
  // sendTransport should be available before initializing data channel
  // creates data producer on client
  async createDataProducer(channel: string = DEFAULT_DATA_CHANNEL, type: UnreliableMessageType = 'raw', customInitInfo: any = {}): Promise<DataProducer | Error> {
    // else if (MediaStreamComponent.instance.dataProducers.get(channel)) return Promise.reject(new Error('Data channel already exists!'))
    const dataProducer = await this.sendTransport.produceData({
      appData: { data: customInitInfo }, // Probably Add additional info to send to server
      ordered: false,
      label: channel,
      maxPacketLifeTime: 3000,
      // maxRetransmits: 3,
      protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
    });
    console.log('data producer created on client!')
    dataProducer.on("open", () => {
      console.log(`Data channel: '${dataProducer.label}' open...`)
      dataProducer.send(JSON.stringify({ info: 'init' }));
    });
    dataProducer.on("transportclose", () => {
      MediaStreamComponent.instance.dataProducers.delete(channel);
      dataProducer.close()
    });
    console.log("Setting data producer")
    MediaStreamComponent.instance.dataProducers.set(channel, dataProducer);
    return Promise.resolve(dataProducer)
  }

  // Create data consumer and subscribe to the other client's producer when signalled
  handleDataConsumerCreation = async (options: DataConsumerOptions) => {
    console.log("Data consumer creation")
    const dataConsumer = await this.recvTransport.consumeData(options)
    console.log("Data consumer created")

    dataConsumer.on('message', handleDataChannelConsumerMessage(dataConsumer)) // Handle message received
    console.log("Setting data consumer")
    MediaStreamComponent.instance.dataConsumers.set(options.dataProducerId, dataConsumer)
    dataConsumer.on('close', () => {
      dataConsumer.close()
      MediaStreamComponent.instance.dataConsumers.delete(options.dataProducerId)
    }) // Handle message received
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  async sendData(data: any, channel: string = DEFAULT_DATA_CHANNEL): Promise<UnreliableMessageReturn> {
    const dataProducer: DataProducer | undefined = MediaStreamComponent.instance.dataProducers.get(channel)
    if (!dataProducer) throw new Error('Data Channel not initialized on client, Data Producer doesn\'t exist!')
    console.log("Sending data on data channel: ", channel);
    dataProducer.send(data)
    return Promise.resolve(dataProducer);
  }

  // Adds support for Promise to socket.io-client
  promisedRequest(socket: SocketIOClient.Socket) {
    return function request(type: any, data = {}): any {
      return new Promise(resolve => socket.emit(type, data, resolve));
    };
  }

  public async initialize(address = "https://127.0.0.1", port = 3030): Promise<void> {
    console.log(`Initializing client transport to ${address}:${port}`);
    this.mediasoupDevice = new Device();

    this.socket = ioclient(`${address}:${port}`, {
      query: {
        cool: 'pants'
      }
    });
    this.request = this.promisedRequest(this.socket);

    // window.screenshare = await this.startScreensharea

    console.log(`Initializing socket.io...,`);
    this.socket.on("connect", async () => {
      console.log("Connected!");

      Network.instance.mySocketID = this.socket.id

      // If a reliable message is received, add it to the queue
      this.socket.on(MessageTypes.ReliableMessage.toString(), (message) => {
        Network.instance.incomingMessageQueue.add(message)
      })

      // use sendBeacon to tell the server we're disconnecting when
      // the page unloads
      window.addEventListener("unload", async () => {
        this.socket.emit(MessageTypes.LeaveWorld.toString());
      });

      console.log("Attempting to join world")
      await this.joinWorld();

      // Ping request for testing unreliable messaging may remove if not needed
      console.log('About to init receive and send transports')
      // Init Receive and Send Transports initially since we need them for unreliable message consumption and production
      await Promise.all([this.initSendTransport(), this.initReceiveTransport()])

      await this.createDataProducer()

      console.log("About to send camera streams");
      // await this.sendCameraStreams();
    });
    this.socket.on(MessageTypes.WebRTCConsumeData.toString(), this.handleDataConsumerCreation);
    this.socket.on(MessageTypes.WebRTCCreateProducer.toString(), async (socketId, mediaTag) => {
      if (
          (MediaStreamComponent.instance.mediaStream !== null) &&
          (MediaStreamComponent.instance.consumers?.find(
              c => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag
          ) == null)
      ) {
        // that we don't already have consumers for...
        console.log(`auto subscribing to ${mediaTag} track that ${socketId} has added at ${new Date()}`);
        await this.subscribeToTrack(socketId, mediaTag);
      }
    });

    this.socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async(consumerId) => {
      console.log('Close consumer ' + consumerId)
      console.log('Old consumers:')
      console.log(MediaStreamComponent.instance.consumers)
      MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter((c) => c.id !== consumerId)
      console.log('New consumers:')
      console.log(MediaStreamComponent.instance.consumers)
    })
  }

  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
  // Mediasoup Code:
  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

  async joinWorld() {
    // signal that we're a new peer and initialize our
    // mediasoup-client device, if this is our first time connecting

    console.log("Joining world");
    const resp = await this.request(MessageTypes.JoinWorld.toString());

    const { worldState, routerRtpCapabilities } = resp as any;

    console.log("World state init: ")
    console.log(worldState)
    // TODO: This shouldn't be in the transport, should be in our network system somehow
    // Apply all state to initial frame
    applyWorldState(worldState)

    console.log("Loading mediasoup");
    if (this.mediasoupDevice.loaded !== true) await this.mediasoupDevice.load({ routerRtpCapabilities });

    console.log("Joined world");
    return Promise.resolve()
  }

  // Init receive transport, create one if it doesn't exist else just resolve promise
  async initReceiveTransport(): Promise<MediaSoupTransport | Error> {
    console.log('Creating receive transport')
    this.recvTransport = await this.createTransport("recv");
    return Promise.resolve(this.recvTransport);
  }

  // Init send transport, create one if it doesn't exist else just resolve promise
  async initSendTransport(): Promise<MediaSoupTransport | Error> {
    console.log('Creating send transport')
    this.sendTransport = await this.createTransport("send");
    return Promise.resolve(this.sendTransport);
  }

  async sendCameraStreams(): Promise<void> {
    console.log("send camera streams");
    // start sending video. the transport logic will initiate a
    // signaling conversation with the server to set up an outbound rtp
    // stream for the camera video track. our createTransport() function
    // includes logic to tell the server to start the stream in a paused
    // state, if the checkbox in our UI is unchecked. so as soon as we
    // have a client-side camVideoProducer object, we need to set it to
    // paused as appropriate, too.
    if(MediaStreamComponent.instance.mediaStream == null)
      await MediaStreamSystem.instance.startCamera();
      MediaStreamComponent.instance.camVideoProducer = await this.sendTransport.produce({
      track: MediaStreamComponent.instance.mediaStream.getVideoTracks()[0],
      encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
      appData: { mediaTag: "cam-video" }
    });

    if (MediaStreamComponent.instance.videoPaused) await MediaStreamComponent.instance.camVideoProducer.pause();

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
    MediaStreamComponent.instance.camAudioProducer = await this.sendTransport.produce({
      track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
      appData: { mediaTag: "cam-audio" }
    });

    if (MediaStreamComponent.instance.audioPaused) MediaStreamComponent.instance.camAudioProducer.pause();
  }

  async startScreenshare(): Promise<boolean> {
    console.log("start screen share");

    // make sure we've joined the  and that we have a sending transport
    if (!this.sendTransport) this.sendTransport = await this.createTransport("send");

    // get a screen share track
    MediaStreamComponent.instance.localScreen = await (navigator.mediaDevices as any).getDisplayMedia(
      { video: true, audio: true }
    );

    // create a producer for video
    MediaStreamComponent.instance.screenVideoProducer = await this.sendTransport.produce({
      track: MediaStreamComponent.instance.localScreen.getVideoTracks()[0],
      encodings: [], // TODO: Add me
      appData: { mediaTag: "screen-video" }
    });

    // create a producer for audio, if we have it
    if (MediaStreamComponent.instance.localScreen.getAudioTracks().length) {
      MediaStreamComponent.instance.screenAudioProducer = await this.sendTransport.produce({
        track: MediaStreamComponent.instance.localScreen.getAudioTracks()[0],
        appData: { mediaTag: "screen-audio" }
      });
    }

    // handler for screen share stopped event (triggered by the
    // browser's built-in screen sharing ui)
    MediaStreamComponent.instance.screenVideoProducer.track.onended = async () => {
      console.log("screen share stopped");
      await MediaStreamComponent.instance.screenVideoProducer.pause();

      const { error } = await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.screenVideoProducer.id
      });

      await MediaStreamComponent.instance.screenVideoProducer.close();
      MediaStreamComponent.instance.screenVideoProducer = null;
      if (MediaStreamComponent.instance.screenAudioProducer) {
        const { error: screenAudioProducerError } = await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: MediaStreamComponent.instance.screenAudioProducer.id
        });

        await MediaStreamComponent.instance.screenAudioProducer.close();
        MediaStreamComponent.instance.screenAudioProducer = null;
      }
    };
    return true;
  }

  async endVideoChat(): Promise<boolean> {
    console.log('Closing send transport')
    if (MediaStreamComponent.instance.camVideoProducer) {
      console.log('closing camVideoProducer:')
      console.log(MediaStreamComponent.instance.camVideoProducer)
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.camVideoProducer.id
      });
      await MediaStreamComponent.instance.camVideoProducer.close()
    }
    if (MediaStreamComponent.instance.camAudioProducer) {
      console.log('closing camAudioProducer:')
      console.log(MediaStreamComponent.instance.camAudioProducer)
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.camAudioProducer.id
      });
      await MediaStreamComponent.instance.camAudioProducer.close()
    }
    if (MediaStreamComponent.instance.screenVideoProducer) {
      console.log('closing screenVideoProducer:')
      console.log(MediaStreamComponent.instance.screenVideoProducer)
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.screenVideoProducer.id
      });
      await MediaStreamComponent.instance.screenVideoProducer.close()
    }
    if (MediaStreamComponent.instance.screenAudioProducer) {
      console.log('closing screenAudioProducer:')
      console.log(MediaStreamComponent.instance.screenAudioProducer)
      await this.request(MessageTypes.WebRTCCloseProducer.toString(), {
        producerId: MediaStreamComponent.instance.screenAudioProducer.id
      });
      await MediaStreamComponent.instance.screenAudioProducer.close()
    }

    MediaStreamComponent.instance.consumers.map(async (c) => {
      await this.request(MessageTypes.WebRTCCloseConsumer.toString(), {
        consumerId: c.id
      });
      await c.close();
    });
    this.resetProducer();
    return true;
  }

  resetProducer(): void {
    MediaStreamComponent.instance.camVideoProducer = null;
    MediaStreamComponent.instance.camAudioProducer = null;
    MediaStreamComponent.instance.screenVideoProducer = null;
    MediaStreamComponent.instance.screenAudioProducer = null;
    MediaStreamComponent.instance.mediaStream = null;
    MediaStreamComponent.instance.localScreen = null;
    MediaStreamComponent.instance.consumers = [];
  }

  async leave(): Promise<boolean> {
    try {
      console.log('Attempting to leave client transport')
      this.leaving = true;

      // stop polling
      clearInterval(this.pollingInterval);
      console.log('Cleared interval')

      // close everything on the server-side (transports, producers, consumers)
      const result = await this.request(MessageTypes.LeaveWorld.toString());
      console.log('LeaveWorld result:')
      console.log(result)
      if (result.error) {
        console.error(result.error);
      }
      console.log('Left World')

      // closing the transports closes all producers and consumers. we
      // don't need to do anything beyond closing the transports, except
      // to set all our local variables to their initial states
      if (this.recvTransport) await this.recvTransport.close();
      console.log('Closed receive transport')
      if (this.sendTransport) await this.sendTransport.close();
      console.log('Removed send transport')

      this.recvTransport = null;
      this.sendTransport = null;
      MediaStreamComponent.instance.camVideoProducer = null;
      MediaStreamComponent.instance.camAudioProducer = null;
      MediaStreamComponent.instance.screenVideoProducer = null;
      MediaStreamComponent.instance.screenAudioProducer = null;
      MediaStreamComponent.instance.mediaStream = null;
      MediaStreamComponent.instance.localScreen = null;
      this.lastPollSyncData = {};
      MediaStreamComponent.instance.consumers = [];
      this.leaving = false;
      console.log('Nulled everything')
      return true;
    } catch (err) {
      console.log('Error with leave()')
      console.log(err)
    }
  }

  async subscribeToTrack(peerId: string, mediaTag: string) {
    // if we do already have a consumer, we shouldn't have called this method
    let consumer = MediaStreamComponent.instance.consumers.find(
      (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
    );

    // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
    const consumerParameters = await this.request(MessageTypes.WebRTCReceiveTrack.toString(),
      { mediaTag, mediaPeerId: peerId, rtpCapabilities: this.mediasoupDevice.rtpCapabilities }
    );

    console.log(`Requesting consumer for peer ${peerId} of type ${mediaTag} at ${new Date()}`)

    consumer = await this.recvTransport.consume(
      { ...consumerParameters, appData: { peerId, mediaTag } }
    );

    console.log('New Consumer:');
    console.log(consumer);

    const stats = await consumer.getStats();

    if (MediaStreamComponent.instance.consumers?.find(c => c?.appData?.peerId === peerId && c?.appData?.mediaTag === mediaTag) == null) {
      let connected = false;
      MediaStreamComponent.instance.consumers.push(consumer);
      console.log(`Pushed consumer for peer ${peerId} of type ${mediaTag} at ${new Date()}`)

      connected = true;

      // okay, we're ready. let's ask the peer to send us media
      await this.resumeConsumer(consumer);
    } else {
      await this.closeConsumer(consumer);
    }
  }

  async unsubscribeFromTrack(peerId: any, mediaTag: any) {
    console.log("unsubscribe from track", peerId, mediaTag);
    const consumer = MediaStreamComponent.instance.consumers.find(
      c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
    );
    await this.closeConsumer(consumer);
  }

  public async pauseConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; pause: () => any }) {
    console.log("pause consumer", consumer.appData.peerId, consumer.appData.mediaTag);
    await this.request(MessageTypes.WebRTCPauseConsumer.toString(), { consumerId: consumer.id });
    await consumer.pause();
  }

  public async resumeConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; resume: () => any }) {
    console.log("resume consumer", consumer.id, consumer.appData.peerId, consumer.appData.mediaTag);
    await this.request(MessageTypes.WebRTCResumeConsumer.toString(), { consumerId: consumer.id });
    await consumer.resume();
  }

  async pauseProducer(producer: { appData: { mediaTag: any }; id: any; pause: () => any }) {
    console.log("pause producer", producer.appData.mediaTag);
    await this.request(MessageTypes.WebRTCPauseProducer.toString(), { producerId: producer.id });
    await producer.pause();
  }

  async resumeProducer(producer: { appData: { mediaTag: any }; id: any; resume: () => any }) {
    console.log("resume producer", producer.appData.mediaTag);
    await this.request(MessageTypes.WebRTCResumeProducer.toString(), { producerId: producer.id });
    await producer.resume();
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
  async createTransport(direction: string) {
    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport;
    const { transportOptions } = await this.request(MessageTypes.WebRTCTransportCreate.toString(), { direction, sctpCapabilities: this.mediasoupDevice.sctpCapabilities });
    console.log("transport options", transportOptions);

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
      const { error } = await this.request(MessageTypes.WebRTCTransportConnect.toString(),
      { transportId: transportOptions.id, dtlsParameters }
      );
      if (error) return errback();
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
          console.log(rtpParameters)

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
            console.log(error)
            return
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
            console.log(error)
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
        this.endVideoChat()
      }
    });


    return Promise.resolve(transport);
  }
}