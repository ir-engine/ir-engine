import mediasoup from "mediasoup"
import express from "express"
import * as https from "https"
import fs from "fs"
import SocketIO, { Socket } from "socket.io"
import * as path from "path"
import { MessageTypes } from "../../enums/MessageTypes"
import * as dotenv from "dotenv"
import { NetworkTransport } from "../../interfaces/NetworkTransport"
import { Network } from "../../components/Network"
import { Message } from "../../interfaces/Message"
import {
  DataConsumer,
  DataConsumerOptions,
  DataProducer,
  DataProducerOptions,
  Router,
  SctpParameters,
  Transport,
  WebRtcTransport
} from "mediasoup/lib/types"
import { types as MediaSoupClientTypes } from "mediasoup-client"
import { UnreliableMessageParams, UnreliableMessageReturn } from "../../types/NetworkingTypes"

dotenv.config()
interface Client {
  socket: SocketIO.Socket
  lastSeenTs: number
  joinTs: number
  media: any
  consumerLayers: any
  stats: any
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
      listenIps: [{ ip: "127.0.0.1", announcedIp: null }],
      initialAvailableOutgoingBitrate: 800000
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
  dataProducers: [] as DataProducer[],
  dataConsumers: [] as DataConsumer[],
  peers: []
}

const tls = {
  cert: fs.readFileSync(path.resolve(path.dirname("./"), process.env.CERT)),
  key: fs.readFileSync(path.resolve(path.dirname("./"), process.env.KEY)),
  requestCert: false,
  rejectUnauthorized: false
}

const sctpParameters: SctpParameters = {
  OS: 16,
  MIS: 10,
  maxMessageSize: 65535,
  port: 5000
}

export class SocketWebRTCServerTransport implements NetworkTransport {
  server: https.Server
  socketIO: SocketIO.Server
  worker
  router: Router
  transport: Transport

  roomState = defaultRoomState

  sendReliableMessage(message: any): void {
      this.socketIO.sockets.emit(MessageTypes.ReliableMessage.toString(), message)
  }

  handleConsumeDataEvent = (socket: SocketIO.Socket) => async (
    data: { consumerOptions: DataConsumerOptions; transportId: string },
    callback: (arg0: { dataConsumerOptions?: MediaSoupClientTypes.DataConsumerOptions; error?: any }) => void
  ) => {
    try {
      console.log("Got Data channel subscription from client with params: ", data)
      console.log("Getting transport ID")
      const transport: Transport | undefined = this.roomState.transports[data.transportId]
      if (!transport) {
        throw new Error("Transport is not available for the transport id or it is invalid")
      }
      data.consumerOptions.appData = { ...(data.consumerOptions.appData || {}), peerId: socket.id }
      console.log("Creating DataConsumer")
      const dataConsumer = await transport.consumeData(data.consumerOptions)
      this.roomState.dataConsumers.push(dataConsumer)
      console.log("Adding DataConsumer to roomstate")
      dataConsumer.on("transportclose", () => {
        console.log("closing DataConsumer and removing it from roomstate")
        dataConsumer.close()
        this.roomState.dataConsumers = this.roomState.dataConsumers.filter(
          (consumer: DataConsumer) => consumer.id !== dataConsumer.id
        )
      })
      const options: { dataConsumerOptions: MediaSoupClientTypes.DataConsumerOptions } = {
        dataConsumerOptions: {
          id: dataConsumer.id,
          label: dataConsumer.label,
          sctpStreamParameters: dataConsumer.sctpStreamParameters,
          appData: data.consumerOptions.appData,
          dataProducerId: dataConsumer.dataProducerId
        }
      }
      console.log("Sending data consumer options to client: ", options)
      callback(options)
    } catch (error) {
      callback({ error })
    }
  }

  // WIP -- Init transport before calling with how it works right now in server?
  async sendUnreliableMessage({
    channel,
    data,
    type = "json"
  }: UnreliableMessageParams): Promise<UnreliableMessageReturn> {
    if (!data.transportId) {
      return Promise.reject(new Error("TransportId not provided!"))
    }
    return this.transport.produceData({
      appData: { data }, // Probably Add additional info to send to server
      sctpStreamParameters: data.sctpStreamParameters,
      label: channel,
      protocol: type
    })
  }

  public async initialize(address = "127.0.0.1", port = 3001): Promise<void> {
    config.mediasoup.webRtcTransport.listenIps = [{ ip: address, announcedIp: null }]
    await this.startMediasoup()

    const expressApp = express()

    // start https server
    console.log("Starting Express")
    await new Promise(resolve => {
      this.server = new https.Server(tls, expressApp as any)
      this.server
        .on("error", e => console.error("https server error,", e.message))
        .listen(port, address, () => {
          console.log(`https server listening on port ${port}`)
          resolve()
        })
    })

    // Start Websockets
    console.log("Starting websockets")
    this.socketIO = SocketIO(this.server)

    // every 10 seconds, check for inactive clients and send them into cyberspace
    setInterval(() => {
      this.roomState.peers.forEach((value: any, key: any) => {
        if (Date.now() - value.lastSeenTs > 10000) {
          delete this.roomState.peers[key]
          console.log("Culling inactive user with id", key)
        }
      })
    }, 10000)

    this.socketIO.sockets.on("connect", (socket: Socket) => {
      //Add a new client indexed by his id
      this.roomState.peers[socket.id] = {
        socket: socket,
        lastSeenTs: Date.now(),
        joinTs: Date.now(),
        media: {},
        consumerLayers: {},
        stats: {}
      }

      console.log("Sending peers:")
      console.log(this.roomState.peers)

      // Respond to initialization request with a list of clients
      socket.emit(MessageTypes.Initialization.toString(), socket.id, Object.keys(this.roomState.peers))

      //Update everyone that the number of users has changed
      socket.broadcast.emit(MessageTypes.ClientConnected.toString(), socket.id)

      // Handle the disconnection
      socket.on(MessageTypes.Disconnect.toString(), () => {
        console.log(
          "User " + socket.id + " diconnected, there are " + this.socketIO.clients.length + " clients connected"
        )
        //Delete this client from the object
        delete this.roomState.peers[socket.id]
        for (const otherSocket of this.roomState.peers as Client[]) {
          otherSocket.socket.emit(MessageTypes.ClientDisconnected.toString(), socket.id)
          console.log("Telling client ", otherSocket, " about disconnection of " + socket.id)
        }
      })

      // If a reliable message is received, add it to the queue
      socket.on(MessageTypes.ReliableMessage.toString(), (message: Message) => {
        // TODO: Handle reliable message
      })

      // On heartbeat received from client
      socket.on(MessageTypes.Heartbeat, () => {
        if (this.roomState.peers[socket.id] !== undefined) {
          this.roomState.peers[socket.id].lastSeenTs = Date.now()
          console.log("Heartbeat from client " + socket.id)
        } else console.log("Receiving message from peer who isn't in client list")
      })

      //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
      // Mediasoup Signaling:
      // --> /signaling/sync
      // client polling endpoint. send back our 'peers' data structure
      socket.on(MessageTypes.Synchronization.toString(), (data, callback) => {
        // make sure this peer is connected. if we've disconnected the
        // peer because of a network outage we want the peer to know that
        // happened, when/if it returns
        if (this.roomState.peers[socket.id] === undefined) throw new Error("not connected")

        // update our most-recently-seem timestamp -- we're not stale!
        this.roomState.peers[socket.id].lastSeenTs = Date.now()

        callback({
          peers: this.roomState.peers.keys()
        })
      })

      // --> /signaling/join-as-new-peer
      // adds the peer to the roomState data structure and creates a
      // transport that the peer will use for receiving media. returns
      // router rtpCapabilities for mediasoup-client device initialization
      socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) => {
        console.log("Join world request", socket.id)
        callback({ routerRtpCapabilities: this.router.rtpCapabilities })
      })

      // --> /signaling/leave
      // removes the peer from the roomState data structure and and closes
      // all associated mediasoup objects
      socket.on(MessageTypes.LeaveWorld.toString(), () => {
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
      })

      // --> /signaling/create-transport
      // create a mediasoup transport object and send back info needed
      // to create a transport object on the client side
      socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data, callback) => {
        const peerId = socket.id
        const { direction } = data
        console.log("WebRTCTransportCreateRequest", peerId, direction)

        const transport = await this.createWebRtcTransport({ peerId, direction })
        this.roomState.transports[transport.id] = transport

        const { id, iceParameters, iceCandidates, dtlsParameters } = transport
        const clientTransportOptions: MediaSoupClientTypes.TransportOptions = {
          id,
          sctpParameters,
          iceParameters,
          iceCandidates,
          dtlsParameters
        }
        callback({
          transportOptions: clientTransportOptions
        })
      })
      socket.on(
        MessageTypes.WebRTCProduceData,
        async (params, callback: (arg0: { id?: string; error?: any }) => void) => {
          try {
            const { transportId, sctpStreamParameters, label, protocol, appData } = params
            console.log("Data channel used: ", `'${label}'`, "by client id: ", socket.id)
            console.log("Data channel params", params)
            const transport = this.roomState.transports[transportId] as Transport
            let dataProducer: DataProducer | undefined
            if (appData.dataProducerId) {
              dataProducer = this.roomState.dataProducers.find(prod => prod.id === appData.dataProducerId)
            }
            if (dataProducer === undefined) {
              const options: DataProducerOptions = {
                label,
                protocol,
                sctpStreamParameters,
                appData: { ...appData, peerID: socket.id, transportId }
              }
              console.log("creating transport data producer")
              dataProducer = await transport.produceData(options)
              console.log("adding data producer to room state")
              this.roomState.dataProducers.push(dataProducer)

              // if our associated transport closes, close ourself, too
              dataProducer.on("transportclose", () => {
                console.log("data producer's transport closed: ", dataProducer.id)
                dataProducer.close()
                this.roomState.dataProducers = this.roomState.dataProducers.filter(
                  producer => producer.id !== dataProducer.id
                )
              })
              console.log("Sending dataproducer id to client:", dataProducer.id)
              return callback({ id: dataProducer.id })
            }

            // Possibly do stuff with appData here

            console.log("Sending dataproducer id to client:", dataProducer.id)
            return callback({ id: dataProducer.id })
          } catch (e) {
            console.log("ERROR SENDING DATA TO DATA CHANNEL: ", e)
            callback({ error: e })
          }
        }
      )
      socket.on(MessageTypes.WebRTCConsumeData, this.handleConsumeDataEvent(socket))

      // --> /signaling/connect-transport
      // called from inside a client's `transport.on('connect')` event
      // handler.
      socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) => {
        const { transportId, dtlsParameters } = data,
          transport = this.roomState.transports[transportId]
        console.log("WebRTCTransportConnectRequest", socket.id, transport.appData)
        await transport.connect({ dtlsParameters })
        callback({ connected: true })
      })

      // called by a client that wants to close a single transport (for
      // example, a client that is no longer sending any media).
      socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) => {
        console.log("close-transport", socket.id, this.transport.appData)
        const { transportId } = data
        this.transport = this.roomState.transports[transportId]
        await this.closeTransport(this.transport)
        callback({ closed: true })
      })

      // called by a client that is no longer sending a specific track
      socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
        const { producerId } = data,
          producer = this.roomState.producers.find(p => p.id === producerId)
        console.log("WebRTCCloseProducerRequest", socket.id, producer.appData)
        await this.closeProducerAndAllPipeProducers(producer, socket.id)
        callback({ closed: true })
      })

      // called from inside a client's `transport.on('produce')` event handler.
      socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) => {
        const peerId = socket.id
        const { transportId, kind, rtpParameters, paused = false, appData } = data,
          transport = this.roomState.transports[transportId]

        const producer = await transport.produce({
          kind,
          rtpParameters,
          paused,
          appData: { ...appData, peerID: peerId, transportId }
        })

        // if our associated transport closes, close ourself, too
        producer.on("transportclose", () => {
          console.log("producer's transport closed", producer.id)
          this.closeProducerAndAllPipeProducers(producer, peerId)
        })

        this.roomState.producers.push(producer)
        this.roomState.peers[peerId].media[appData.mediaTag] = {
          paused,
          encodings: rtpParameters.encodings
        }

        callback({ id: producer.id })
      })

      // --> /signaling/recv-track
      // create a mediasoup consumer object, hook it up to a producer here
      // on the server side, and send back info needed to create a consumer
      // object on the client side. always start consumers paused. client
      // will request media to resume when the connection completes
      socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) => {
        const { mediaPeerId, mediaTag, rtpCapabilities } = data
        const peerId = socket.id
        const producer = this.roomState.producers.find(
          p => p.appData.mediaTag === mediaTag && p.appData.peerId === mediaPeerId
        )
        if (!this.router.canConsume({ producerId: producer.id, rtpCapabilities })) {
          const msg = `client cannot consume ${mediaPeerId}:${mediaTag}`
          console.error(`recv-track: ${peerId} ${msg}`)
          callback({ error: msg })
          return
        }

        const transport = Object.values(this.roomState.transports).find(
          t => (t as any).appData.peerId === peerId && (t as any).appData.clientDirection === "recv"
        )

        const consumer = await (transport as any).consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: true, // see note above about always starting paused
          appData: { peerId, mediaPeerId, mediaTag }
        })

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
          console.log(`consumer layerschange ${mediaPeerId}->${peerId}`, mediaTag, layers)
          if (this.roomState.peers[peerId] && this.roomState.peers[peerId].consumerLayers[consumer.id]) {
            this.roomState.peers[peerId].consumerLayers[consumer.id].currentLayer = layers && layers.spatialLayer
          }
        })

        callback({
          producerId: producer.id,
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          type: consumer.type,
          producerPaused: consumer.producerPaused
        })
      })

      // --> /signaling/pause-consumer
      // called to pause receiving a track for a specific client
      socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) => {
        const { consumerId } = data,
          consumer = this.roomState.consumers.find(c => c.id === consumerId)
        console.log("pause-consumer", consumer.appData)
        await consumer.pause()
        callback({ paused: true })
      })

      // --> /signaling/resume-consumer
      // called to resume receiving a track for a specific client
      socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) => {
        const { consumerId } = data,
          consumer = this.roomState.consumers.find(c => c.id === consumerId)
        console.log("resume-consumer", consumer.appData)
        await consumer.resume()
        callback({ resumed: true })
      })

      // --> /signalign/close-consumer
      // called to stop receiving a track for a specific client. close and
      // clean up consumer object
      socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) => {
        const { consumerId } = data,
          consumer = this.roomState.consumers.find(c => c.id === consumerId)
        console.log("WebRTCCloseConsumerRequest", data)
        await this.closeConsumer(consumer)
        callback({ closed: true })
      })

      // --> /signaling/consumer-set-layers
      // called to set the largest spatial layer that a specific client
      // wants to receive
      socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) => {
        const { consumerId, spatialLayer } = data,
          consumer = this.roomState.consumers.find(c => c.id === consumerId)
        console.log("consumer-set-layers", spatialLayer, consumer.appData)
        await consumer.setPreferredLayers({ spatialLayer })
        callback({ layersSet: true })
      })

      // --> /signaling/pause-producer
      // called to stop sending a track from a specific client
      socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) => {
        const { producerId } = data,
          producer = this.roomState.producers.find(p => p.id === producerId)
        console.log("pause-producer", producer.appData)
        await producer.pause()
        this.roomState.peers[socket.id].media[producer.appData.mediaTag].paused = true
        callback({ paused: true })
      })

      // --> /signaling/resume-producer
      // called to resume sending a track from a specific client
      socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) => {
        const { producerId } = data,
          producer = this.roomState.producers.find(p => p.id === producerId)
        console.log("resume-producer", producer.appData)
        await producer.resume()
        this.roomState.peers[socket.id].media[producer.appData.mediaTag].paused = false
        callback({ resumed: true })
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
      this.worker = await mediasoup.createWorker({
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort
      })
    } catch (e) {
      console.log("Failed jwith exception:")
      console.log(e)
    }
    this.worker.on("died", () => {
      console.error("mediasoup worker died (this should never happen)")
      process.exit(1)
    })
    console.log("Worker got created")

    const mediaCodecs = config.mediasoup.router.mediaCodecs
    this.router = await this.worker.createRouter({ mediaCodecs })
    console.log("Worker created router")
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
    console.log("closing producer", producer.id, producer.appData)
    await producer.close()

    // remove this producer from our roomState.producers list
    this.roomState.producers = this.roomState.producers.filter(p => p.id !== producer.id)

    // remove this track's info from our roomState...mediaTag bookkeeping
    if (this.roomState.peers[producer.appData.peerId])
      this.roomState.peers[producer.appData.peerId].media[producer.appData.mediaTag]
  }

  async closeProducerAndAllPipeProducers(producer, peerId): Promise<void> {
    console.log("closing producer", producer.id, producer.appData)

    // first, close all of the pipe producer clones
    console.log("Closing all pipe producers for peer with id", peerId)

    // remove this producer from our roomState.producers list
    this.roomState.producers = this.roomState.producers.filter(p => p.id !== producer.id)

    // finally, close the original producer
    await producer.close()

    // remove this producer from our roomState.producers list
    this.roomState.producers = this.roomState.producers.filter(p => p.id !== producer.id)

    // remove this track's info from our roomState...mediaTag bookkeeping
    if (this.roomState.peers[producer.appData.peerId])
      delete this.roomState.peers[producer.appData.peerId].media[producer.appData.mediaTag]
  }

  async closeConsumer(consumer): Promise<void> {
    console.log("closing consumer", consumer.id, consumer.appData)
    await consumer.close()

    // remove this consumer from our roomState.consumers list
    this.roomState.consumers = this.roomState.consumers.filter(c => c.id !== consumer.id)

    // remove layer info from from our roomState...consumerLayers bookkeeping
    if (this.roomState.peers[consumer.appData.peerId])
      delete this.roomState.peers[consumer.appData.peerId].consumerLayers[consumer.id]
  }

  async createWebRtcTransport({ peerId, direction }): Promise<WebRtcTransport> {
    console.log("Creating Mediasoup transport")
    const { listenIps, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport
    const transport = await this.router.createWebRtcTransport({
      listenIps: listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: true, // Enabling it for setting up data channels
      numSctpStreams: {
        OS: sctpParameters.OS,
        MIS: sctpParameters.MIS
      },
      initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
      appData: { peerId, clientDirection: direction }
    })

    return transport
  }
}
