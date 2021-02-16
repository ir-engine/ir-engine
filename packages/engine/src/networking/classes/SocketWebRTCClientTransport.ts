import { User } from "@xr3ngine/common/interfaces/User";
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { Network } from "../classes/Network";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { applyNetworkStateToClient } from "@xr3ngine/engine/src/networking/functions/applyNetworkStateToClient";
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import * as mediasoupClient from "mediasoup-client";
import { Transport as MediaSoupTransport } from "mediasoup-client/lib/types";
import getConfig from "next/config";
import ioclient from "socket.io-client";
import store from "@xr3ngine/client-core/redux/store";
import { createDataProducer, endVideoChat, initReceiveTransport, initSendTransport, leave, subscribeToTrack } from "../functions/SocketWebRTCClientFunctions";

const { publicRuntimeConfig } = getConfig();
const gameserver = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.gameserver : 'https://127.0.0.1:3030';
const Device = mediasoupClient.Device;

export class SocketWebRTCClientTransport implements NetworkTransport {
  isServer = false
  mediasoupDevice: mediasoupClient.Device
  leaving = false
  instanceRecvTransport: MediaSoupTransport
  instanceSendTransport: MediaSoupTransport
  channelRecvTransport: MediaSoupTransport
  channelSendTransport: MediaSoupTransport
  lastPollSyncData = {}
  pollingTickRate = 1000
  pollingTimeout = 4000
  instanceSocket: SocketIOClient.Socket = {} as SocketIOClient.Socket
  channelSocket: SocketIOClient.Socket = {} as SocketIOClient.Socket
  instanceRequest: any
  channelRequest: any
  localScreen: any;
  lastPoll: Date;
  pollPending = false;
  videoEnabled = false;
  channelType: string;
  channelId: string;
  instanceDataProducer: any;
  channelDataProducer: any;

  /**
 * Send a message over TCP with websockets
 * @param message message to send
 */
  sendReliableData(message, instance = true): void {
    if (instance === true) this.instanceSocket.emit(MessageTypes.ReliableMessage.toString(), message);
    else this.channelSocket.emit(MessageTypes.ReliableMessage.toString(), message);
  }

  handleKick(socket) {
    console.log("Handling kick: ", socket);
  }

  toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: any, instance = true): void {
    if (instance === true) {
      if (!this.instanceDataProducer)
        throw new Error('Data Producer not initialized on client, Instance Data Producer doesn\'t exist!');
      if (this.instanceDataProducer.closed !== true) this.instanceDataProducer.send(this.toBuffer(data));
    } else {
      if (!this.channelDataProducer)
        throw new Error('Data Producer not initialized on client, Channel Data Producer doesn\'t exist!');
      if (this.channelDataProducer.closed !== true) this.channelDataProducer.send(this.toBuffer(data));
    }
  }

  // Adds support for Promise to socket.io-client
  promisedRequest(socket: SocketIOClient.Socket) {
    return function request(type: any, data = {}): any {
      return new Promise(resolve => socket.emit(type, data, resolve));
    };
  }

  public async initialize(address = "https://127.0.0.1", port = 3030, instance: boolean, opts?: any): Promise<void> {
    const self = this;
    const token = (store.getState() as any).get('auth').get('authUser').accessToken;
    const selfUser = (store.getState() as any).get('auth').get('user') as User;
    let socket = instance === true ? this.instanceSocket : this.channelSocket;

    Network.instance.userId = selfUser.id;
    Network.instance.accessToken = token;

    this.mediasoupDevice = new Device();
    if (socket && socket.close) socket.close();

    const { startVideo, videoEnabled, channelType, ...query } = opts;
    this.channelType = channelType;
    this.channelId = opts.channelId;

    this.videoEnabled = videoEnabled ?? false;

    if (query.locationId == null) delete query.locationId;
    if (query.sceneId == null) delete query.sceneId;
    if (query.channelId == null) delete query.channelId;
    if (process.env.NODE_ENV === 'development') {
      socket = ioclient(`${address as string}:${port.toString()}/realtime`, {
        query: query
      });
    } else {
      socket = ioclient(`${gameserver}/realtime`, {
        path: `/socket.io/${address as string}/${port.toString()}`,
        query: query
      });
    }

    console.log('New socket:');
    console.log(socket);
    console.log('instance?', instance);

    (socket as any).instance = instance === true;

    if (instance === true) this.instanceSocket = socket;
    else this.channelSocket = socket;
    console.log(this.instanceSocket);
    console.log(this.channelSocket);

    if (instance === true) Network.instance.instanceSocketId = socket.id;
    else Network.instance.channelSocketId = socket.id;

    if (instance === true) this.instanceRequest = this.promisedRequest(socket);
    else this.channelRequest = this.promisedRequest(socket);

    socket.on("connect", async () => {
      const request = (socket as any).instance === true ? this.instanceRequest : this.channelRequest;
      const payload = { userId: Network.instance.userId, accessToken: Network.instance.accessToken };
      const { success } = await request(MessageTypes.Authorization.toString(), payload);

      if (!success) return console.error("Unable to connect with credentials");

      let ConnectToWorldResponse;

      try {
        ConnectToWorldResponse = await Promise.race([
          await request(MessageTypes.ConnectToWorld.toString()),
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Connect timed out')), 10000)
          })
      ]);
      } catch(err) {
        console.log(err);
        window.dispatchEvent(new CustomEvent('connectToWorldTimeout', {'instance': instance === true} as any));
        return
      }
      console.log('ConnectToWorldResponse:');
      console.log(ConnectToWorldResponse);
      const { worldState, routerRtpCapabilities } = ConnectToWorldResponse as any;

      window.dispatchEvent(new CustomEvent('connectToWorld'));

      // Send heartbeat every second
      const heartbeat = setInterval(() => {
        socket.emit(MessageTypes.Heartbeat.toString());
      }, 1000);

      // Apply all state to initial frame
      applyNetworkStateToClient(worldState);

      if (this.mediasoupDevice.loaded !== true)
        await this.mediasoupDevice.load({ routerRtpCapabilities });


      // If a reliable message is received, add it to the queue
      socket.on(MessageTypes.ReliableMessage.toString(), (message) => {
        Network.instance?.incomingMessageQueue.add(message);
      });

      // use sendBeacon to tell the server we're disconnecting when
      // the page unloads
      window.addEventListener("unload", async () => {
        // TODO: Handle this as a full disconnect
        socket.emit(MessageTypes.LeaveWorld.toString());
      });

      socket.on('disconnect', async () => {
        console.log('socket disconnecting', (socket as any).instance);
        if ((socket as any).instance !== true) self.channelId = null;
        await endVideoChat({ endConsumers: true });
        await leave((socket as any).instance === true);
        clearInterval(heartbeat);
        // this.socket.close();
      });

      socket.on(MessageTypes.Kick.toString(), async () => {
        // console.log("TODO: SNACKBAR HERE");
        clearInterval(heartbeat);
        await endVideoChat({ endConsumers: true });
        await leave((socket as any).instance === true);
        socket.close();
        console.log("Client has been kicked from the world");
      });

      // Get information for how to consume data from server and init a data consumer
      socket.on(MessageTypes.WebRTCConsumeData.toString(), async (options) => {
        console.log("WebRTC consume data called");
        console.log(options);
        const dataConsumer = await this.instanceRecvTransport.consumeData(options);
        Network.instance?.dataConsumers.set(options.dataProducerId, dataConsumer);

        dataConsumer.on('message', (message: any) => {
          try{
            Network.instance?.incomingMessageQueue.add(message);
          } catch (error){
            console.warn("Error handling data from consumer:");
            console.warn(error);
          }
        }); // Handle message received
        dataConsumer.on('close', () => {
          dataConsumer.close();
          Network.instance?.dataConsumers.delete(options.dataProducerId);
        });
      });

      socket.on(MessageTypes.WebRTCCreateProducer.toString(), async (socketId, mediaTag, producerId, channelType, channelId) => {
        const selfProducerIds = [
          MediaStreamSystem.instance?.camVideoProducer?.id,
          MediaStreamSystem.instance?.camAudioProducer?.id
        ];
        if (
          // (MediaStreamSystem.mediaStream !== null) &&
          (producerId != null) &&
          (selfProducerIds.indexOf(producerId) < 0) &&
          (MediaStreamSystem.instance?.consumers?.find(
            c => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag
          ) == null /*&&
            (channelType === 'instance' ? this.channelType === 'instance' : this.channelType === channelType && this.channelId === channelId)*/)
        ) {
          // that we don't already have consumers for...
          await subscribeToTrack(socketId, mediaTag, channelType, channelId);
        }
      });

      socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (consumerId) => {
        if (MediaStreamSystem.instance) MediaStreamSystem.instance.consumers = MediaStreamSystem.instance?.consumers.filter((c) => c.id !== consumerId);
      });


      // Init Receive and Send Transports initially since we need them for unreliable message consumption and production
      console.log('Init instance transports?', this.channelType, this.channelId);
      if ((socket as any).instance === true) await Promise.all([initSendTransport('instance'), initReceiveTransport('instance')]);

      await createDataProducer((socket as any).instance === true ? 'instance' : this.channelId );
    });
  }
}