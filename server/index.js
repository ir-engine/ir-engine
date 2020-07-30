/* eslint-disable @typescript-eslint/no-var-requires */
const config = require("../src/networking/transports/serverConfig")
require("dotenv").config()

import MessageTypes from "../src/networking/types/MessageTypes"

const mediasoup = require("mediasoup")
const express = require("express")
const https = require("https")
const fs = require("fs")
const path = require("path")

const expressApp = express()
const socketIO = require("socket.io")

config.mediasoup.webRtcTransport.listenIps = [{ ip: "127.0.0.1", announcedIp: null }]

let server, io, worker, router, transport

const defaultRoomState = {
  // external
  peers: {},
  activeSpeaker: { producerId: null, volume: null, peerId: null },
  // internal
  transports: {},
  producers: [],
  consumers: []
}

let roomState = defaultRoomState

let clients = {}

const tls = {
  cert: fs.readFileSync(path.resolve(__dirname, "..", process.env.CERT)),
  key: fs.readFileSync(path.resolve(__dirname, "..", process.env.KEY)),
  requestCert: false,
  rejectUnauthorized: false
}

main() // entry point

async function main() {
  await startMediasoup()

  // start https server
  console.log("Starting Express")
  server = https.createServer(tls, expressApp)
  server.on("error", e => console.error("https server error,", e.message))

  server.listen(3001, () => console.log(`https server listening on port 3001`))

  // Start Websockets
  console.log("Starting websockets")
  io = socketIO(server)

  // every 5 seconds, check for inactive clients and send them into cyberspace
  setInterval(() => {
    let now = Date.now()
    for (let id in clients) if (now - clients[id].lastSeenTs > 10000) console.log("Culling inactive user with id", id)
  }, 5000)

  io.on(MessageTypes.ConnectionRequest, socket => {
    console.log("User " + socket.id + " connected, there are " + io.engine.clientsCount + " clients connected")

    //Add a new client indexed by his id
    clients[socket.id]
    // Respond to initialization request with a list of clients
    socket.emit(MessageTypes.InitializationResponse, socket.id, Object.keys(clients))

    //Update everyone that the number of users has changed
    io.sockets.emit(MessageTypes.ConnectionResponse, io.engine.clientsCount, socket.id, Object.keys(clients))

    // On heartbeat received from client
    socket.on(MessageTypes.Heartbeat, () => {
      if (clients[socket.id]) clients[socket.id].lastSeenTs = Date.now()
      else console.log("Receiving message from peer who isn't in client list")
    })

    // Handle the disconnection
    socket.on(MessageTypes.DisconnectionRequest, () => {
      //Delete this client from the object
      delete clients[socket.id]
      io.sockets.emit(MessageTypes.DisconnectionResponse, socket.id, Object.keys(clients))
      console.log("User " + socket.id + " diconnected, there are " + io.engine.clientsCount + " clients connected")
    })

    //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
    // Mediasoup Signaling:
    // --> /signaling/sync
    // client polling endpoint. send back our 'peers' data structure
    socket.on(MessageTypes.SynchronizationRequest, async (data, callback) => {
      // make sure this peer is connected. if we've disconnected the
      // peer because of a network outage we want the peer to know that
      // happened, when/if it returns
      if (!roomState.peers[socket.id]) throw new Error("not connected")

      // update our most-recently-seem timestamp -- we're not stale!
      roomState.peers[socket.id].lastSeenTs = Date.now()

      callback({
        peers: roomState.peers
      })
    })

    // --> /signaling/join-as-new-peer
    // adds the peer to the roomState data structure and creates a
    // transport that the peer will use for receiving media. returns
    // router rtpCapabilities for mediasoup-client device initialization
    socket.on(MessageTypes.JoinWorldRequest, async (data, callback) => {
      let peerId = socket.id
      let now = Date.now()
      console.log("Join world request", peerId)

      roomState.peers[peerId] = {
        joinTs: now,
        lastSeenTs: now,
        media: {},
        consumerLayers: {},
        stats: {}
      }

      callback({ routerRtpCapabilities: router.rtpCapabilities })
    })

    // --> /signaling/leave
    // removes the peer from the roomState data structure and and closes
    // all associated mediasoup objects
    socket.on(MessageTypes.LeaveWorldRequest, async (data, callback) => {
      console.log("leave", socket.id)
      await closePeer(socket.id)
      callback({ left: true })
    })

    // --> /signaling/create-transport
    // create a mediasoup transport object and send back info needed
    // to create a transport object on the client side
    socket.on(MessageTypes.WebRTCTransportCreateRequest, async (data, callback) => {
      let peerId = socket.id
      let { direction } = data
      console.log("WebRTCTransportCreateRequest", peerId, direction)

      let transport = await createWebRtcTransport({ peerId, direction })
      roomState.transports[transport.id] = transport

      let { id, iceParameters, iceCandidates, dtlsParameters } = transport
      callback({
        transportOptions: {
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters
        }
      })
    })

    // --> /signaling/connect-transport
    // called from inside a client's `transport.on('connect')` event
    // handler.
    socket.on(MessageTypes.WebRTCTransportConnectRequest, async (data, callback) => {
      console.log("WebRTCTransportConnectRequest", socket.id, transport.appData)
      let { transportId, dtlsParameters } = data,
        transport = roomState.transports[transportId]
      await transport.connect({ dtlsParameters })
      callback({ connected: true })
    })

    // called by a client that wants to close a single transport (for
    // example, a client that is no longer sending any media).
    socket.on(MessageTypes.WebRTCTransportCloseRequest, async (data, callback) => {
      console.log("close-transport", socket.id, transport.appData)
      let { transportId } = data
      transport = roomState.transports[transportId]
      await closeTransport(transport, socket.id)
      callback({ closed: true })
    })

    // called by a client that is no longer sending a specific track
    socket.on(MessageTypes.WebRTCCloseProducerRequest, async (data, callback) => {
      console.log("WebRTCCloseProducerRequest", socket.id, producer.appData)
      let { producerId } = data,
        producer = roomState.producers.find(p => p.id === producerId)
      await closeProducerAndAllPipeProducers(producer, socket.id)
      callback({ closed: true })
    })

    // called from inside a client's `transport.on('produce')` event handler.
    socket.on(MessageTypes.WebRTCSendTrackRequest, async (data, callback) => {
      let peerId = socket.id
      let { transportId, kind, rtpParameters, paused = false, appData } = data,
        transport = roomState.transports[transportId]

      let producer = await transport.produce({
        kind,
        rtpParameters,
        paused,
        appData: { ...appData, peerID: peerId, transportId }
      })

      // if our associated transport closes, close ourself, too
      producer.on("transportclose", () => {
        console.log("producer's transport closed", producer.id)
        closeProducerAndAllPipeProducers(producer, peerId)
      })

      roomState.producers.push(producer)
      roomState.peers[peerId].media[appData.mediaTag] = {
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
    socket.on(MessageTypes.WebRTCReceiveTrackRequest, async (data, callback) => {
      let { mediaPeerId, mediaTag, rtpCapabilities } = data
      let peerId = socket.id
      let producer = roomState.producers.find(p => p.appData.mediaTag === mediaTag && p.appData.peerId === mediaPeerId)
      if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
        let msg = `client cannot consume ${mediaPeerId}:${mediaTag}`
        console.err(`recv-track: ${peerId} ${msg}`)
        callback({ error: msg })
        return
      }

      let transport = Object.values(roomState.transports).find(t => t.appData.peerId === peerId && t.appData.clientDirection === "recv")

      let consumer = await transport.consume({
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
        closeConsumer(consumer, peerId)
      })
      consumer.on("producerclose", () => {
        console.log(`consumer's producer closed`, consumer.id)
        closeConsumer(consumer, peerId)
      })

      // stick this consumer in our list of consumers to keep track of,
      // and create a data structure to track the client-relevant state
      // of this consumer
      roomState.consumers.push(consumer)
      roomState.peers[peerId].consumerLayers[consumer.id] = {
        currentLayer: null,
        clientSelectedLayer: null
      }

      // update above data structure when layer changes.
      consumer.on("layerschange", layers => {
        console.log(`consumer layerschange ${mediaPeerId}->${peerId}`, mediaTag, layers)
        if (roomState.peers[peerId] && roomState.peers[peerId].consumerLayers[consumer.id]) {
          roomState.peers[peerId].consumerLayers[consumer.id].currentLayer = layers && layers.spatialLayer
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
    socket.on(MessageTypes.WebRTCPauseConsumerRequest, async (data, callback) => {
      console.log("pause-consumer", consumer.appData)
      let { consumerId } = data,
        consumer = roomState.consumers.find(c => c.id === consumerId)
      await consumer.pause()
      callback({ paused: true })
    })

    // --> /signaling/resume-consumer
    // called to resume receiving a track for a specific client
    socket.on(MessageTypes.WebRTCResumeConsumerRequest, async (data, callback) => {
      console.log("resume-consumer", consumer.appData)
      let { consumerId } = data,
        consumer = roomState.consumers.find(c => c.id === consumerId)
      await consumer.resume()
      callback({ resumed: true })
    })

    // --> /signalign/close-consumer
    // called to stop receiving a track for a specific client. close and
    // clean up consumer object
    socket.on(MessageTypes.WebRTCCloseConsumerRequest, async (data, callback) => {
      console.log("WebRTCCloseConsumerRequest", data)
      let { consumerId } = data,
        consumer = roomState.consumers.find(c => c.id === consumerId)
      await closeConsumer(consumer, socket.id)
      callback({ closed: true })
    })

    // --> /signaling/consumer-set-layers
    // called to set the largest spatial layer that a specific client
    // wants to receive
    socket.on(MessageTypes.WebRTCConsumerSetLayersRequest, async (data, callback) => {
      console.log("consumer-set-layers", spatialLayer, consumer.appData)
      let { consumerId, spatialLayer } = data,
        consumer = roomState.consumers.find(c => c.id === consumerId)
      await consumer.setPreferredLayers({ spatialLayer })
      callback({ layersSet: true })
    })

    // --> /signaling/pause-producer
    // called to stop sending a track from a specific client
    socket.on(MessageTypes.WebRTCCloseProducerRequest, async (data, callback) => {
      console.log("pause-producer", producer.appData)
      let { producerId } = data,
        producer = roomState.producers.find(p => p.id === producerId)
      await producer.pause()
      roomState.peers[socket.id].media[producer.appData.mediaTag].paused = true
      callback({ paused: true })
    })

    // --> /signaling/resume-producer
    // called to resume sending a track from a specific client
    socket.on(MessageTypes.WebRTCResumeProducerRequest, async (data, callback) => {
      console.log("resume-producer", producer.appData)
      let { producerId } = data,
        producer = roomState.producers.find(p => p.id === producerId)
      await producer.resume()
      roomState.peers[socket.id].media[producer.appData.mediaTag].paused = false
      callback({ resumed: true })
    })
  })
}

// start mediasoup with a single worker and router
async function startMediasoup() {
  console.log("Starting mediasoup")
  // Initialize roomstate
  roomState = defaultRoomState
  worker = await mediasoup.createWorker({
    logLevel: config.mediasoup.worker.logLevel,
    logTags: config.mediasoup.worker.logTags,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort
  })

  worker.on("died", () => {
    console.error("mediasoup worker died (this should never happen)")
    process.exit(1)
  })

  const mediaCodecs = config.mediasoup.router.mediaCodecs
  router = await worker.createRouter({ mediaCodecs })

  // audioLevelObserver for signaling active speaker
  const audioLevelObserver = await router.createAudioLevelObserver({ interval: 800 })

  audioLevelObserver.on("volumes", volumes => {
    const { producer, volume } = volumes[0]
    console.log("audio-level volumes event", producer.appData.peerId, volume)
    roomState.activeSpeaker.producerId = producer.id
    roomState.activeSpeaker.volume = volume
    roomState.activeSpeaker.peerId = producer.appData.peerId
  })
  audioLevelObserver.on("silence", () => {
    console.log("audio-level silence event")
    roomState.activeSpeaker.producerId = null
    roomState.activeSpeaker.volume = null
    roomState.activeSpeaker.peerId = null
  })
}

function closePeer(peerId) {
  console.log("closing peer", peerId)
  for (let [id, transport] of Object.entries(roomState.transports)) if (transport.appData.peerId === peerId) closeTransport(transport, peerId)

  delete roomState.peers[peerId]
}

async function closeTransport(transport) {
  console.log("closing transport", transport.id, transport.appData)

  // our producer and consumer event handlers will take care of
  // calling closeProducer() and closeConsumer() on all the producers
  // and consumers associated with this transport
  await transport.close()

  // so all we need to do, after we call transport.close(), is update
  // our roomState data structure
  delete roomState.transports[transport.id]
}

async function closeProducer(producer) {
  console.log("closing producer", producer.id, producer.appData)
  await producer.close()

  // remove this producer from our roomState.producers list
  roomState.producers = roomState.producers.filter(p => p.id !== producer.id)

  // remove this track's info from our roomState...mediaTag bookkeeping
  if (roomState.peers[producer.appData.peerId]) delete roomState.peers[producer.appData.peerId].media[producer.appData.mediaTag]
}

async function closeProducerAndAllPipeProducers(producer, peerId) {
  console.log("closing producer", producer.id, producer.appData)

  // first, close all of the pipe producer clones
  console.log("Closing all pipe producers for peer with id", peerId)

  // remove this producer from our roomState.producers list
  roomState.producers = roomState.producers.filter(p => p.id !== producer.id)

  // finally, close the original producer
  await producer.close()

  // remove this producer from our roomState.producers list
  roomState.producers = roomState.producers.filter(p => p.id !== producer.id)

  // remove this track's info from our roomState...mediaTag bookkeeping
  if (roomState.peers[producer.appData.peerId]) delete roomState.peers[producer.appData.peerId].media[producer.appData.mediaTag]
}

async function closeConsumer(consumer) {
  console.log("closing consumer", consumer.id, consumer.appData)
  await consumer.close()

  // remove this consumer from our roomState.consumers list
  roomState.consumers = roomState.consumers.filter(c => c.id !== consumer.id)

  // remove layer info from from our roomState...consumerLayers bookkeeping
  if (roomState.peers[consumer.appData.peerId]) delete roomState.peers[consumer.appData.peerId].consumerLayers[consumer.id]
}

async function createWebRtcTransport({ peerId, direction }) {
  const { listenIps, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport

  const transport = await router.createWebRtcTransport({
    listenIps: listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerId, clientDirection: direction }
  })

  return transport
}
