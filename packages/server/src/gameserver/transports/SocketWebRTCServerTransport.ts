import { Network } from "@xr3ngine/engine/src/networking/components/Network"
import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes"
import { Message } from "@xr3ngine/engine/src/networking/interfaces/Message"
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport"
import * as https from "https"
import { createWorker } from 'mediasoup'
import {
  DataConsumer,
  DataProducer,
  DataProducerOptions,
  Router,
  RtpCodecCapability,
  SctpParameters,
  Transport,
  WebRtcTransport,
  Worker
} from "mediasoup/lib/types"
import { types as MediaSoupClientTypes } from "mediasoup-client"
import { UnreliableMessageReturn, UnreliableMessageType, CreateWebRtcTransportParams } from "@xr3ngine/engine/src/networking/types/NetworkingTypes"
import { networkInterfaces } from 'os'
import { worldStateModel } from "@xr3ngine/engine/src/networking/schema/worldStateSchema"
import SocketIO, { Socket } from "socket.io"
import app from '../../app'

interface Client {
  socket: SocketIO.Socket;
  lastSeenTs: number;
  joinTs: number;
  media: any;
  consumerLayers: any;
  stats: any;
}

const config = {
  httpPeerStale: 15000,
  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
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
}

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
}

const sctpParameters: SctpParameters = {
  OS: 1024,
  MIS: 65535,
  maxMessageSize: 65535,
  port: 5000
}

export class SocketWebRTCServerTransport implements NetworkTransport {
  isServer: boolean = true
  server: https.Server
  socketIO: SocketIO.Server
  worker: Worker
  router: Router
  transport: Transport

  roomState = defaultRoomState

  sendReliableMessage(message: any): void {
    console.log('Sending Reliable Message')
    console.log(message)
    this.socketIO.sockets.emit(MessageTypes.ReliableMessage.toString(), message)
  }

  // WIP -- sort of stub, creates and returns data producer. Remove if not needed.
  async sendUnreliableMessage(data: any, channel: string = 'default', params: { type?: UnreliableMessageType } = {}): Promise<UnreliableMessageReturn> {
    if (!data.transportId) {
      return Promise.reject(new Error("TransportId not provided!"))
    }
    return this.transport.produceData({
      appData: { data }, // Probably Add additional info to send to server
      sctpStreamParameters: data.sctpStreamParameters,
      label: channel,
      protocol: params.type || 'json'
    })
  }

  public async initialize(address, port = 3030): Promise<void> {
    console.log('Initializing server transport')
    if (process.env.KUBERNETES === 'true') {
      (app as any).agonesSDK.getGameServer().then((gsStatus) => {
        console.log('gsStatus:')
        console.log(gsStatus)
        config.mediasoup.webRtcTransport.listenIps = [{ ip: gsStatus.status.address, announcedIp: null }]
      })
    } else {
      const nets = networkInterfaces();
      const results = Object.create(null); // or just '{}', an empty object
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
              results[name] = [];
            }

            results[name].push(net.address);
          }
        }
      }
      config.mediasoup.webRtcTransport.listenIps = [{ip: results.en0 ? results.en0[0] : results.eno1 ? results.eno1[0] : '127.0.0.1', announcedIp: null}]
    }
    console.log(config.mediasoup.webRtcTransport)
    await this.startMediasoup()
    console.log('Started mediasoup')

    // const expressApp = express()
    //
    // // start https server
    // console.log("Starting Express")
    // await new Promise(resolve => {
    //   this.server = new https.Server(tls, expressApp as any)
    //   this.server
    //     .on("error", e => console.error("https server error,", e.message))
    //     .listen(port, address, () => {
    //       console.log(`https server listening on port ${port}`)
    //       resolve()
    //     })
    // })

    // Start Websockets
    console.log("Starting websockets")
    this.socketIO = (app as any)?.io

    // every 10 seconds, check for inactive clients and send them into cyberspace
    setInterval(() => {
      console.log('Inactive client check')
      Object.entries(this.roomState.peers).forEach(([key, value]) => {
        if (Date.now() - (value as Client).lastSeenTs > 10000) {
          delete this.roomState.peers[key]
          const peerConsumers = this.roomState.consumers.filter((c) => c._appData.peerId === key);
          const peerProducers = this.roomState.producers.filter((c) => c._appData.peerId === key);
          console.log("Culling inactive user with id", key);
          peerConsumers.forEach((c) => this.closeConsumer(c));
          peerProducers.forEach((p)=> this.closeProducer(p));
        }
      })

      this.roomState.consumers.forEach(async (c) => {
        const peer = this.roomState.peers[c._appData.peerId]
        if (peer == null) {
          await this.closeConsumer(c);
        }
      })
    }, 10000)

    this.socketIO.sockets.on("connect", (socket: Socket) => {
      console.log('Socket Connected')
      //Add a new client indexed by his id
      this.roomState.peers[socket.id] = {
        socket: socket,
        lastSeenTs: Date.now(),
        joinTs: Date.now(),
        media: {},
        consumerLayers: {},
        stats: {},
        dataConsumers: new Map<string, DataConsumer>(), // Key => id of data producer
        dataProducers: new Map<string, DataProducer>() // Key => label of data channel
      }

      // Handle the disconnection
      socket.on("disconnect", () => {
        try {
          console.log(
            "User " + socket.id + " diconnected, there are " + this.socketIO.clients.length + " clients connected"
          )
          //Delete this client from the object
          delete this.roomState.peers[socket.id]
          Object.entries(this.roomState.peers).forEach(([key, value]) => {
            const otherSocket = value as Client
            otherSocket.socket.emit(MessageTypes.ClientDisconnected.toString(), socket.id)
            console.log("Telling client ", otherSocket.socket.id, " about disconnection of " + socket.id)
          })
        } catch (err) {
          console.log('Disconnect error')
          console.log(err)
        }
      })

      // If a reliable message is received, add it to the queue
      socket.on(MessageTypes.ReliableMessage.toString(), (message: Message) => {
        try {
          console.log('Got Reliable Message')
          console.log(message)
          Network.instance.incomingMessageQueue.add(message.data)
        } catch (err) {
          console.log('Reliable message error')
          console.log(err)
        }
      })

      // On heartbeat received from client
      socket.on(MessageTypes.Heartbeat.toString(), () => {
        try {
          console.log('Heartbeat handler')
          if (this.roomState.peers[socket.id] != null) {
            this.roomState.peers[socket.id].lastSeenTs = Date.now()
            console.log("Heartbeat from client " + socket.id)
          } else console.log("Receiving message from peer who isn't in client list")
        } catch (err) {
          console.log('Heartbeat error')
          console.log(err)
        }
      })

      //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
      // Mediasoup Signaling:
      // --> /signaling/sync
      // client polling endpoint. send back our 'peers' data structure
      socket.on(MessageTypes.Synchronization.toString(), (data, callback) => {
        try {
          console.log(`Synchronization from ${socket.id}`)
          // make sure this peer is connected. if we've disconnected the
          // peer because of a network outage we want the peer to know that
          // happened, when/if it returns
          if (this.roomState.peers[socket.id] == null) callback({
            error: 'not connected'
          })

          try {
            // update our most-recently-seem timestamp -- we're not stale!
            this.roomState.peers[socket.id].lastSeenTs = Date.now()
          } catch (err) {
            console.log(`peer ${socket.id} no longer exists`)
          }

          console.log(this.roomState.consumers.map((c) => c.id + ' ' + c._appData.peerId + ' ' + c._appData.mediaTag))
          const returned = {}
          Object.entries(this.roomState.peers).forEach(([key, value]) => {
            const { socket, ...paredPeer } = (value as Client)
            returned[key] = paredPeer
          })
          callback({
            peers: returned
          })
        } catch (err) {
          console.log('Sync handle error');
          console.log(err);
        }
      })

      // TODO:
      // Join World response
      // Get list of clients (id + username)
      // Get list of network objects (id, owner, prefabtype, position, rotation)
      socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) => {
        console.log("Join world request", socket.id)
        // Receive user ID and set for peer
        const { userId } = data
        console.log("Socket ID is ", socket.id)
        // Add user ID to peer list
        this.roomState.peers[socket.id]["userId"] = userId
        // Create a snapshot of world state
        // 
        let peers = {}
        Object.keys(this.roomState.peers).forEach(key => {
          peers[key] = { userId: this.roomState.peers[key]["userId"] }
        })

        // Prepare a worldstate frame
        const worldState = {
          tick: Network.tick,
          transforms: [],
          inputs: [],
          clientsConnected: [],
          clientsDisconnected: [],
          createObjects: [],
          destroyObjects: []
        }

        // Get all clients and add to clientsConnected
        for (const clientId in Network.instance.clients) {
          worldState.clientsConnected.push({ clientId, userId: Network.instance.clients[clientId].userId })
        }

        // Get all network objects and add to createObjects
        for (const networkid in Network.instance.networkObjects) {
          worldState.createObjects.push({ networkid, ownerId: Network.instance.networkObjects[networkid].ownerId })
        }

        // TODO: Get all inputs and add to inputs

        // Convert world state to buffer and send along
        callback({ worldState: worldStateModel.toBuffer(worldState), routerRtpCapabilities: this.router.rtpCapabilities })
      })

      // --> /signaling/leave
      // removes the peer from the roomState data structure and and closes
      // all associated mediasoup objects
      socket.on(MessageTypes.LeaveWorld.toString(), async (data, callback) => {
        try {
          console.log('Leave World handler')
          console.log("closing peer", socket.id)
          if (this.roomState.transports)
            for (const [, transport] of Object.entries(this.roomState.transports))
              if ((transport as any).appData.peerId === socket.id) this.closeTransport(transport)

          if (this.roomState.peers[socket.id] !== undefined) {
            delete this.roomState.peers[socket.id]
            console.log("Removing ", socket.id, " from client list")
          } else {
            console.log("could not remove peer, already removed")
          }
          callback({})
        } catch(err) {
          console.log('Leave world handler')
          console.log(err)
          callback({error: err})
        }
      });

      // --> /signaling/create-transport
      // create a mediasoup transport object and send back info needed
      // to create a transport object on the client side
      socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: CreateWebRtcTransportParams, callback) => {
        try {
          console.log('Transport Create handler')
          const { direction, peerId, sctpCapabilities } = Object.assign(data, { peerId: socket.id })
          console.log("WebRTCTransportCreateRequest", peerId, direction)

          const transport: WebRtcTransport = await this.createWebRtcTransport({
            peerId,
            direction,
            sctpCapabilities,
          })
          await transport.setMaxIncomingBitrate(config.mediasoup.webRtcTransport.maxIncomingBitrate)
          this.roomState.transports[transport.id] = transport
          // Probably just save transports this way so we can distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
          if (direction === 'recv') {
            this.roomState.peers[socket.id].recvTransport = transport
          } else if (direction === 'send') {
            this.roomState.peers[socket.id].sendTransport = transport
          }

          const {id, iceParameters, iceCandidates, dtlsParameters} = transport
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
          }
          // Create data consumers for other clients if the current client transport receives data producer on it
          transport.observer.on('newdataproducer', this.handleConsumeDataEvent(socket))
          console.log('New transport:')
          console.log(transport)
          callback({
            transportOptions: clientTransportOptions
          })
        } catch (err) {
          console.log('WebRTC Transport Create error')
          console.log(err)
          callback({ error: err })
        }
      })
      socket.on(
        MessageTypes.WebRTCProduceData.toString(),
        async (params, callback: (arg0: { id?: string; error?: any }) => void) => {
          console.log('Produce Data handler')
          try {
            if (!params.label) throw ({ error: 'data producer label i.e. channel name is not provided!' })
            const { transportId, sctpStreamParameters, label, protocol, appData } = params
            console.log("Data channel label: ", `'${label}'`, " -- client id: ", socket.id)
            console.log("Data producer params", params)
            const transport: Transport = this.roomState.transports[transportId]
            const options: DataProducerOptions = {
              label,
              protocol,
              sctpStreamParameters,
              appData: { ...(appData || {}), peerID: socket.id, transportId }
            }
            console.log("creating transport data producer")
            const dataProducer = await transport.produceData(options)
            console.log("data producer created!", dataProducer.id)

            console.log("adding data producer to room state")
            this.roomState.peers[socket.id].dataProducers.set(label, dataProducer)

            // if our associated transport closes, close ourself, too
            dataProducer.on("transportclose", () => {
              console.log("data producer's transport closed: ", dataProducer.id)
              dataProducer.close()
              this.roomState.peers[socket.id].dataProducers.delete(socket.id)
            })
            // Possibly do stuff with appData here
            console.log("Sending dataproducer id to client:", dataProducer.id)
            return callback({ id: dataProducer.id })
          } catch (e) {
            console.log("Error in creating data producer: ", e)
            callback({ error: e })
          }
        }
      )

      // --> /signaling/connect-transport
      // called from inside a client's `transport.on('connect')` event
      // handler.
      socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) => {
        try {
          console.log('Transport Connect handler')
          const { transportId, dtlsParameters } = data,
            transport = this.roomState.transports[transportId]
          console.log("WebRTCTransportConnectRequest", socket.id, transport.appData)
          await transport.connect({ dtlsParameters })
          callback({ connected: true })
        } catch (err) {
          console.log('WebRTC Transport Connnect error')
          console.log(err)
        }
      })

      // called by a client that wants to close a single transport (for
      // example, a client that is no longer sending any media).
      socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) => {
        try {
          console.log("close-transport", socket.id)
          const {transportId} = data
          this.transport = this.roomState.transports[transportId]
          await this.closeTransport(this.transport)
          callback({closed: true})
        } catch(err) {
          console.log('WebRTC Transport close error')
          console.log(err)
        }
      })

      // called by a client that is no longer sending a specific track
      socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
        try {
          console.log('Close Producer handler')
          const {producerId} = data,
              producer = this.roomState.producers.find(p => p.id === producerId)
          await this.closeProducerAndAllPipeProducers(producer, socket.id)
          callback({ closed: true })
        } catch (err) {
          console.log('WebRTC Producer close error')
          console.log(err)
        }
      })

      // called from inside a client's `transport.on('produce')` event handler.
      socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) => {
        try {
          console.log('Send Track handler')
          const peerId = socket.id
          const { transportId, kind, rtpParameters, paused = false, appData } = data,
            transport = this.roomState.transports[transportId]

          const producer = await transport.produce({
            kind,
            rtpParameters,
            paused,
            appData: {...appData, peerId: peerId, transportId}
          })

          // if our associated transport closes, close ourself, too
          producer.on("transportclose", () => {
            this.closeProducerAndAllPipeProducers(producer, peerId)
          })

          console.log('New producer')
          console.log(producer._data.rtpParameters)

          this.roomState.producers.push(producer)
          this.roomState.peers[peerId].media[appData.mediaTag] = {
            paused,
            encodings: rtpParameters.encodings
          }

          callback({id: producer.id})
        } catch(err) {
          console.log('WebRTC send track error')
          console.log(err)
        }
      })

      // --> /signaling/recv-track
      // create a mediasoup consumer object, hook it up to a producer here
      // on the server side, and send back info needed to create a consumer
      // object on the client side. always start consumers paused. client
      // will request media to resume when the connection completes
      socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) => {
        try {
          console.log('Receive Track handler')
          console.log(data)
          const {mediaPeerId, mediaTag, rtpCapabilities} = data
          const peerId = socket.id
          const producer = this.roomState.producers.find(
              p => p._appData.mediaTag === mediaTag && p._appData.peerId === mediaPeerId
          );
          if (producer == null || !this.router.canConsume({producerId: producer.id, rtpCapabilities})) {
            const msg = `client cannot consume ${mediaPeerId}:${mediaTag}`
            console.error(`recv-track: ${peerId} ${msg}`)
            callback({ error: msg })
            return
          }

          const transport = Object.values(this.roomState.transports).find(
            t => (t as any)._appData.peerId === peerId && (t as any)._appData.clientDirection === "recv"
          )

          const consumer = await (transport as any).consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true, // see note above about always starting paused
            appData: { peerId, mediaPeerId, mediaTag }
          })

          console.log('New consumer: ')
          console.log(consumer)
          console.log('Transport used:')
          console.log(transport)

          // need both 'transportclose' and 'producerclose' event handlers,
          // to make sure we close and clean up consumers in all
          // circumstances
          consumer.on("transportclose", () => {
            console.log(`consumer's transport closed`, consumer.id)
            this.closeConsumer(consumer)
          })
          consumer.on("producerclose", () => {
            console.log(`consumer's producer closed`, consumer.id)
            this.closeConsumer(consumer)
          })
          consumer.on('producerpause', () => {
            console.log(`consumer's producer paused`, consumer.id)
            consumer.pause()
            socket.emit(MessageTypes.WebRTCPauseConsumer.toString(), consumer.id)
          })
          consumer.on('producerresume', () => {
            console.log(`consumer's producer resumed`, consumer.id)
            consumer.resume()
            socket.emit(MessageTypes.WebRTCResumeConsumer.toString(), consumer.id)
          })

          // stick this consumer in our list of consumers to keep track of,
          // and create a data structure to track the client-relevant state
          // of this consumer
          this.roomState.consumers.push(consumer)
          this.roomState.peers[peerId].consumerLayers[consumer.id] = {
            currentLayer: null,
            clientSelectedLayer: null
          }

          // update above data structure when layer changes.
          consumer.on("layerschange", layers => {
            if (this.roomState.peers[peerId] && this.roomState.peers[peerId].consumerLayers[consumer.id]) {
              this.roomState.peers[peerId].consumerLayers[consumer.id].currentLayer = layers && layers.spatialLayer
            }
          })

          console.log('Consumer callback parameters:')
          console.log({
            producerId: producer.id,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            producerPaused: consumer.producerPaused
          })

          callback({
            producerId: producer.id,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            producerPaused: consumer.producerPaused
          })
        } catch (err) {
          console.log('Receive track error')
          console.log(err)
          callback({ error: err })
        }
      })

      // --> /signaling/pause-consumer
      // called to pause receiving a track for a specific client
      socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) => {
        try {
          console.log('Pause Consumer handler')
          const { consumerId } = data,
            consumer = this.roomState.consumers.find(c => c.id === consumerId)
          console.log("pause-consumer", consumer.appData)
          await consumer.pause()
          callback({ paused: true })
        } catch (err) {
          console.log('WebRTC Pause consumer error')
          console.log(err)
        }
      })

      // --> /signaling/resume-consumer
      // called to resume receiving a track for a specific client
      socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) => {
        try {
          console.log('Resume Consumer handler')
          const { consumerId } = data,
            consumer = this.roomState.consumers.find(c => c.id === consumerId)
          console.log("resume-consumer", consumer.appData)
          await consumer.resume()
          callback({ resumed: true })
        } catch (err) {
          console.log('WebRTC Resume consumer error')
          console.log(err)
        }
      })

      // --> /signalign/close-consumer
      // called to stop receiving a track for a specific client. close and
      // clean up consumer object
      socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) => {
        try {
          console.log('Close Consumer handler')
          const { consumerId } = data,
            consumer = this.roomState.consumers.find(c => c.id === consumerId)
          console.log(`consumerId: ${consumerId}`)
          await this.closeConsumer(consumer)
          callback({ closed: true })
        } catch (err) {
          console.log('WebRTC Close Consumer error')
          console.log(err)
        }
      })

      // --> /signaling/consumer-set-layers
      // called to set the largest spatial layer that a specific client
      // wants to receive
      socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) => {
        try {
          console.log('Consumer Set Layers handler')
          const { consumerId, spatialLayer } = data,
            consumer = this.roomState.consumers.find(c => c.id === consumerId)
          console.log("consumer-set-layers", spatialLayer, consumer.appData)
          await consumer.setPreferredLayers({ spatialLayer })
          callback({ layersSet: true })
        } catch (err) {
          console.log('WebRTC Consumer set layers error')
          console.log(err)
        }
      })

      // --> /signaling/pause-producer
      // called to stop sending a track from a specific client
      // socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
      //   try {
      //     console.log('Close Producer handler')
      //     const {producerId} = data,
      //         producer = this.roomState.producers.find(p => p.id === producerId)
      //     console.log("pause-producer", producer.appData)
      //     await producer.pause()
      //     this.roomState.peers[socket.id].media[producer.appData.mediaTag].paused = true
      //     callback({paused: true})
      //   } catch(err) {
      //     console.log('WebRTC Close Producer error')
      //     console.log(err)
      //   }
      // })

      // --> /signaling/resume-producer
      // called to resume sending a track from a specific client
      socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) => {
        try {
          console.log('Resume Producer handler')
          const { producerId } = data,
            producer = this.roomState.producers.find(p => p.id === producerId)
          console.log("resume-producer", producer.appData)
          await producer.resume()
          this.roomState.peers[socket.id].media[producer.appData.mediaTag].paused = false
          callback({ resumed: true })
        } catch (err) {
          console.log('WebRTC Producer Resume error')
          console.log(err)
        }
      })

      // --> /signaling/resume-producer
      // called to resume sending a track from a specific client
      socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) => {
        try {
          console.log('Pause Producer handler')
          const {producerId} = data,
              producer = this.roomState.producers.find(p => p.id === producerId);
          console.log("pause-producer", producer.appData);
          await producer.pause();
          this.roomState.peers[socket.id].media[producer.appData.mediaTag].paused = true;
          callback({paused: true})
        } catch(err) {
          console.log('WebRTC Producer Pause error')
          console.log(err)
        }
      })
    })
  }

  // start mediasoup with a single worker and router
  async startMediasoup(): Promise<void> {
    console.log("Starting mediasoup")
    // Initialize roomstate
    this.roomState = defaultRoomState
    console.log("Worker starting")
    try {
      this.worker = await createWorker({
        logLevel: 'warn',
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        // dtlsCertificateFile: serverConfig.server.certPath,
        // dtlsPrivateKeyFile: serverConfig.server.keyPath,
        logTags: ['sctp']
      })
    } catch (e) {
      console.log("Failed with exception:")
      console.log(e)
    }
    this.worker.on("died", () => {
      console.error("mediasoup worker died (this should never happen)")
      process.exit(1)
    })
    console.log("Worker got created")

    const mediaCodecs = config.mediasoup.router.mediaCodecs as RtpCodecCapability[]
    console.log("Worker created router")
    this.router = await this.worker.createRouter({ mediaCodecs })
  }
  
  // Create consumer for each client!
  handleConsumeDataEvent = (socket: SocketIO.Socket) => async (
    dataProducer: DataProducer
  ) => {
    console.log('Data Consumer being created on server by client: ', socket.id)
      Object.keys(this.roomState.peers).filter(id => id !== socket.id).forEach(async (socketId: string) => {
        const transport: Transport = this.roomState.peers[socketId].recvTransport
        try {
          const dataConsumer = await transport.consumeData({
            dataProducerId: dataProducer.id,
            appData: { peerId: socket.id, transportId: transport.id },
            maxPacketLifeTime:
              dataProducer.sctpStreamParameters.maxPacketLifeTime,
            maxRetransmits: dataProducer.sctpStreamParameters.maxRetransmits,
            ordered: false,
          })
          console.log('Data Consumer created!')
          dataConsumer.on('producerclose', () => {
            dataConsumer.close()
            this.roomState.peers[socket.id].dataConsumers.delete(
              dataProducer.id
            )
          })
          console.log('Setting data consumer to room state')
          this.roomState.peers[socket.id].dataConsumers.set(
            dataProducer.id,
            dataConsumer
          )
          // Currently Creating a consumer for each client and making it subscribe to the current producer
          socket.to(socketId).emit(MessageTypes.WebRTCConsumeData.toString(), {
            dataProducerId: dataProducer.id,
            sctpStreamParameters: dataConsumer.sctpStreamParameters,
            label: dataConsumer.label,
            id: dataConsumer.id,
            appData: dataConsumer.appData,
            protocol: 'json',
          } as MediaSoupClientTypes.DataConsumerOptions)
        } catch (e) {
           console.log('Error Creating data consumer for client: ', socketId)
        }
      })
  }

  async closeTransport(transport): Promise<void> {
    console.log("closing transport", transport.id, transport.appData)
    // our producer and consumer event handlers will take care of
    // calling closeProducer() and closeConsumer() on all the producers
    // and consumers associated with this transport
    await transport.close()

    // so all we need to do, after we call transport.close(), is update
    // our roomState data structure
    delete this.roomState.transports[transport.id]
  }

  async closeProducer(producer): Promise<void> {
    try {
      console.log("closing producer", producer.id, producer.appData)
      await producer.close()

      // remove this producer from our roomState.producers list
      this.roomState.producers = this.roomState.producers.filter(p => p.id !== producer.id)

      // remove this track's info from our roomState...mediaTag bookkeeping
      if (this.roomState.peers[producer.appData.peerId])
        delete this.roomState.peers[producer.appData.peerId].media[producer.appData.mediaTag]
    } catch(err) {
      console.log('closeProducer error')
      console.log(err)
    }
  }

  async closeProducerAndAllPipeProducers(producer, peerId): Promise<void> {
    try {
      if (producer != null) {
        console.log("closing producer and all pipe producers", producer.id, producer.appData)

        // first, close all of the pipe producer clones
        console.log("Closing all pipe producers for peer with id", peerId)

        // remove this producer from our roomState.producers list
        this.roomState.producers = this.roomState.producers.filter(p => p.id !== producer.id)

        // finally, close the original producer
        await producer.close()

        // remove this producer from our roomState.producers list
        this.roomState.producers = this.roomState.producers.filter(p => p.id !== producer.id)

        // remove this track's info from our roomState...mediaTag bookkeeping
        if (this.roomState.peers[producer.appData.peerId]) {
          delete this.roomState.peers[producer.appData.peerId].media[producer.appData.mediaTag]
        }
      }
    } catch(err) {
      console.log('closeProducerAndAllPipeProducers error')
      console.log(err)
    }
  }

  async closeConsumer(consumer): Promise<void> {
    if (consumer != null) {
      console.log("closing consumer", consumer.id, consumer.appData)
      await consumer.close()

      // remove this consumer from our roomState.consumers list
      console.log('Pre-close consumer length: ' + this.roomState.consumers.length)
      this.roomState.consumers = this.roomState.consumers.filter(c => c.id !== consumer.id)
      console.log('Post-close consumer length: ' + this.roomState.consumers.length)

      // remove layer info from from our roomState...consumerLayers bookkeeping
      if (this.roomState.peers[consumer.appData.peerId])
        delete this.roomState.peers[consumer.appData.peerId].consumerLayers[consumer.id]
    }
  }

  async createWebRtcTransport({ peerId, direction, sctpCapabilities }: CreateWebRtcTransportParams): Promise<WebRtcTransport> {
    console.log("Creating Mediasoup transport")
    const { listenIps, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport
    const transport = await this.router.createWebRtcTransport({
      listenIps: listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: true, // Enabling it for setting up data channels
      numSctpStreams: sctpCapabilities.numStreams,
      initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
      appData: { peerId, clientDirection: direction }
    })

    return transport
  }
}