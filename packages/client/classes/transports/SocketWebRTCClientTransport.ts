import { User } from "@xr3ngine/common/interfaces/User";
import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { applyNetworkStateToClient } from "@xr3ngine/engine/src/networking/functions/applyNetworkStateToClient";
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import * as mediasoupClient from "mediasoup-client";
import { Transport as MediaSoupTransport } from "mediasoup-client/lib/types";
import getConfig from "next/config";
import ioclient from "socket.io-client";
import store from "../../redux/store";
import { createDataProducer, endVideoChat, initReceiveTransport, initSendTransport, leave, subscribeToTrack } from "./WebRTCFunctions";

const { publicRuntimeConfig } = getConfig();
const gameserver = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.gameserver : 'https://localhost:3030';
const Device = mediasoupClient.Device;

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
  dataProducer;

  /**
 * Send a message over TCP with websockets
 * @param message message to send
 */
  sendReliableData(message): void {
    this.socket.emit(MessageTypes.ReliableMessage.toString(), message);
  }

  handleKick(socket) {
    console.log("Handling kick: ", socket);
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: any, channel = "default"): void {
    if (!this.dataProducer)
      throw new Error('Data Channel not initialized on client, Data Producer doesn\'t exist!');
    this.dataProducer.send(JSON.stringify(data));
  }

  // Adds support for Promise to socket.io-client
  promisedRequest(socket: SocketIOClient.Socket) {
    return function request(type: any, data = {}): any {
      return new Promise(resolve => socket.emit(type, data, resolve));
    };
  }

  public async initialize(address = "https://127.0.0.1", port = 3030, opts?: any): Promise<void> {
    const token = (store.getState() as any).get('auth').get('authUser').accessToken;
    const selfUser = (store.getState() as any).get('auth').get('user') as User;

    Network.instance.userId = selfUser.id;
    Network.instance.accessToken = token;

    this.mediasoupDevice = new Device();
    if (this.socket && this.socket.close) this.socket.close();

    const { startVideo, videoEnabled, partyId, ...query } = opts;
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

    Network.instance.socketId = this.socket.id;

    this.request = this.promisedRequest(this.socket);

    this.socket.on("connect", async () => {
      const payload = { userId: Network.instance.userId, accessToken: Network.instance.accessToken };
      const { success } = await this.request(MessageTypes.Authorization.toString(), payload);

      if (!success) return console.error("Unable to connect with credentials");


      const ConnectToWorldResponse = await this.request(MessageTypes.ConnectToWorld.toString());
      const { worldState, routerRtpCapabilities } = ConnectToWorldResponse as any;

      console.log("Connected to world");

      // Send heartbeat every second
      const heartbeat = setInterval(() => {
        this.socket.emit(MessageTypes.Heartbeat.toString());
      }, 1000);

      // Apply all state to initial frame
      applyNetworkStateToClient(worldState);

      if (this.mediasoupDevice.loaded !== true)
        await this.mediasoupDevice.load({ routerRtpCapabilities });


      // If a reliable message is received, add it to the queue
      this.socket.on(MessageTypes.ReliableMessage.toString(), (message) => {
        Network.instance?.incomingMessageQueue.add(message);
      });

      // use sendBeacon to tell the server we're disconnecting when
      // the page unloads
      window.addEventListener("unload", async () => {
        // TODO: Handle this as a full disconnect
        this.socket.emit(MessageTypes.LeaveWorld.toString());
      });

      this.socket.on('disconnect', async () => {
        await endVideoChat({ endConsumers: true });
        await leave();
        clearInterval(heartbeat);
        // this.socket.close();
      });

      this.socket.on(MessageTypes.Kick.toString(), async () => {
        // console.log("TODO: SNACKBAR HERE");
        clearInterval(heartbeat);
        await endVideoChat({ endConsumers: true });
        await leave();
        this.socket.close();
        console.log("Client has been kicked from the world");
      });

      // Get information for how to consume data from server and init a data consumer
      this.socket.on(MessageTypes.WebRTCConsumeData.toString(), async (options) => {
        const dataConsumer = await this.instanceRecvTransport.consumeData(options);
        MediaStreamComponent.instance.dataConsumers.set(options.dataProducerId, dataConsumer);

        dataConsumer.on('message', (message: any) => {
          Network.instance.incomingMessageQueue.add(JSON.parse(message));
        }); // Handle message received
        dataConsumer.on('close', () => {
          dataConsumer.close();
          MediaStreamComponent.instance.dataConsumers.delete(options.dataProducerId);
        });
      });

      this.socket.on(MessageTypes.WebRTCCreateProducer.toString(), async (socketId, mediaTag, producerId, localPartyId) => {
        const selfProducerIds = [
          MediaStreamComponent.instance.camVideoProducer?.id,
          MediaStreamComponent.instance.camAudioProducer?.id
        ];
        if (
          // (MediaStreamComponent.instance.mediaStream !== null) &&
          (producerId != null) &&
          (selfProducerIds.indexOf(producerId) < 0) &&
          (MediaStreamComponent.instance.consumers?.find(
            c => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag
          ) == null &&
            (this.partyId === localPartyId) || localPartyId === 'instance')
        ) {
          // that we don't already have consumers for...
          await subscribeToTrack(socketId, mediaTag, localPartyId);
        }
      });

      this.socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (consumerId) => {
        if (MediaStreamComponent.instance) MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter((c) => c.id !== consumerId);
      });


      // Init Receive and Send Transports initially since we need them for unreliable message consumption and production
      await Promise.all([initSendTransport('instance'), initReceiveTransport('instance')]);

      await createDataProducer();
    });
  }
}