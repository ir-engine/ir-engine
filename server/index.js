/* eslint-disable @typescript-eslint/no-var-requires */
const config = require("./config")
require("dotenv").config()
// if we are in production environment, copy over config from .env file:
config.mediasoup.webRtcTransport.listenIps = [{ ip: "127.0.0.1", announcedIp: null }]

if (process.env.SERVER_IP) {
  config.mediasoup.webRtcTransport.listenIps.push({
    ip: process.env.SERVER_IP,
    announcedIp: null
  })
}

// console.log("Environment Variables:");
// console.log("~~~~~~~~~~~~~~~~~~~~~~~~~");
// console.log(process.env);
// console.log("~~~~~~~~~~~~~~~~~~~~~~~~~");

// IMPORTS

const mediasoup = require("mediasoup")
const express = require("express")
const http = require("http")
const https = require("https")
const fs = require("fs")
const path = require("path")

const expressApp = express()
let server
let io
let socketIO = require("socket.io")

// one mediasoup worker and router
//
// let worker, router, audioLevelObserver;
let workers = []
let routers = []
// let audioLevelObservers = [];
let roomStates = []

//
// and one "room" ...
//
// const roomState = {
//   // external
//   peers: {},
//   activeSpeaker: { producerId: null, volume: null, peerId: null },
//   // internal
//   transports: {},
//   producers: [],
//   consumers: []
// }

// this will store which worker/router/room a peer is in
let peerLocations = {}
//
// for each peer that connects, we keep a table of peers and what
// tracks are being sent and received. we also need to know the last
// time we saw the peer, so that we can disconnect clients that have
// network issues.
//
// for this simple demo, each client polls the server at 1hz, and we
// just send this roomState.peers data structure as our answer to each
// poll request.
//
// [peerId] : {
//   joinTs: <ms timestamp>
//   lastSeenTs: <ms timestamp>
//   media: {
//     [mediaTag] : {
//       paused: <bool>
//       encodings: []
//     }
//   },
//   stats: {
//     producers: {
//       [producerId]: {
//         ...(selected producer stats)
//       }
//     consumers: {
//       [consumerId]: { ...(selected consumer stats) }
//     }
//   }
//   consumerLayers: {
//     [consumerId]:
//         currentLayer,
//         clientSelectedLayer,
//       }
//     }
//   }
// }
//
// we also send information about the active speaker, as tracked by
// our audioLevelObserver.
//
// internally, we keep lists of transports, producers, and
// consumers. whenever we create a transport, producer, or consumer,
// we save the remote peerId in the object's `appData`. for producers
// and consumers we also keep track of the client-side "media tag", to
// correlate tracks.
//

//
// our http server needs to send 'index.html' and 'client-bundle.js'.
// might as well just send everything in this directory ...
//

/**
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let clients = {}

const os = require("os")
const numCPUs = os.cpus().length

async function main() {
  // start mediasoup
  console.log("starting mediasoup")
  for (let i = 0; i < numCPUs; i++) {
    console.log("Starting Mediasoup worker in CPU #", i)
    let worker, router, roomState
    ;({ worker, router, roomState } = await startMediasoup())
    workers[i] = worker
    routers[i] = router
    // audioLevelObservers[i] = audioLevelObserver;
    roomStates[i] = roomState
  }

  // start https server, falling back to http if https fails
  console.log("starting express")
  if (process.env.CERT) {
    const tls = {
      cert: fs.readFileSync(path.resolve(__dirname, "..", process.env.CERT)),
      key: fs.readFileSync(path.resolve(__dirname, "..", process.env.KEY))
    }
    server = https.createServer(tls, expressApp)
    server.on("error", e => {
      console.error("https server error,", e.message)
    })

    await new Promise(resolve => {
      server.listen(3001, () => {
        console.log(`server is running and listening on ` + `https://${config.httpIp}:${config.httpPort}`)
        resolve()
      })
    })
  } else {
    server = http.createServer(expressApp)
    server.listen(3001, () => {
      console.log(`http server listening on port 3000`)
    })
  }

  runSocketServer()

  // periodically clean up peers that disconnected without sending us
  // a final "beacon"
  setInterval(() => {
    console.log("Set interval")
    let now = Date.now()
    for (let i = 0; i < roomStates.length; i++) {
      Object.entries(roomStates[i].peers).forEach(([id, p]) => {
        if (now - p.lastSeenTs > config.httpPeerStale) {
          console.log(`removing stale peer ${id}`)
          closePeer(id)
        }
      })
    }
  }, 1000)
}

main()

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

async function runSocketServer() {
  io = socketIO(server)

  // update all sockets at regular intervals
  setInterval(() => {
    io.sockets.emit("userPositions", clients)
  }, 200)

  // every 5 seconds, check for inactive clients and send them into cyberspace
  setInterval(() => {
    let now = Date.now()
    for (let id in clients) {
      if (now - clients[id].lastSeenTs > 60000) {
        console.log("Culling inactive user with id", id)
        clients[id].position = [1000, 1000, 1000]
      }
    }
  }, 5000)

  io.on("connection", socket => {
    console.log("User " + socket.id + " connected, there are " + io.engine.clientsCount + " clients connected")

    //Add a new client indexed by his id
    clients[socket.id] = {
      position: [1000, 0.5, 1000], // deal with phantom clients by putting them way away in the distance until they update their position
      // position: [0, 0.5, 0],
      // rotation: [0, 0, 0, 1] // stored as XYZW values of Quaternion
      rotation: [0, 0, 0]
    }

    socket.emit("introduction", socket.id, Object.keys(clients))
    // also give the client all existing clients positions:
    socket.emit("userPositions", clients)

    //Update everyone that the number of users has changed
    io.sockets.emit("newUserConnected", io.engine.clientsCount, socket.id, Object.keys(clients))

    socket.on("move", data => {
      let now = Date.now()
      if (clients[socket.id]) {
        clients[socket.id].position = data[0]
        clients[socket.id].rotation = data[1]
        clients[socket.id].lastSeenTs = now
      }
      // io.sockets.emit('userPositions', clients);
    })

    // Handle the disconnection
    socket.on("disconnect", () => {
      //Delete this client from the object
      delete clients[socket.id]
      io.sockets.emit("userDisconnected", socket.id, Object.keys(clients))
      console.log("User " + socket.id + " diconnected, there are " + io.engine.clientsCount + " clients connected")
    })

    //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
    //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
    // Mediasoup Signaling:

    //
    // -- our minimal signaling is just http polling --
    //

    // parse every request body for json, no matter the content-type. this
    // lets us use sendBeacon or fetch interchangeably to POST to
    // signaling endpoints. (sendBeacon can't set the Content-Type header)
    //
    // expressApp.use(express.json({ type: '*/*' }));

    // --> /signaling/sync
    //
    // client polling endpoint. send back our 'peers' data structure and
    // 'activeSpeaker' info
    //
    // socket.on('sync', async (req, res) => {
    socket.on("sync", async (data, callback) => {
      // let { peerId } = req.body;
      let peerId = socket.id

      try {
        let allPeers = {}
        for (let i = 0; i < roomStates.length; i++) {
          Object.assign(allPeers, roomStates[i].peers)
        }
        let peerLoc = peerLocations[peerId.toString()]
        if (peerLoc == undefined) {
          throw new Error("No peerLoc found!")
        }
        // make sure this peer is connected. if we've disconnected the
        // peer because of a network outage we want the peer to know that
        // happened, when/if it returns
        if (!roomStates[peerLoc].peers[peerId]) {
          throw new Error("not connected")
        }

        // update our most-recently-seem timestamp -- we're not stale!
        roomStates[peerLoc].peers[peerId].lastSeenTs = Date.now()

        callback({
          peers: allPeers
          // peers: roomStates[peerLoc].peers,
          // activeSpeaker: roomStates[peerLoc].activeSpeaker,
          // producers: roomStates[peerLoc].producers
        })
      } catch (e) {
        console.error(e.message)
        callback({ error: e.message })
      }
    })

    // --> /signaling/join-as-new-peer
    //
    // adds the peer to the roomState data structure and creates a
    // transport that the peer will use for receiving media. returns
    // router rtpCapabilities for mediasoup-client device initialization
    //
    // expressApp.post('/signaling/join-as-new-peer', async (req, res) => {
    socket.on("join-as-new-peer", async (data, callback) => {
      try {
        // let { peerId } = req.body;
        let peerId = socket.id
        let now = Date.now()
        console.log("join-as-new-peer", peerId)

        // assign random room:
        let peerLoc = getRandomInt(0, numCPUs - 1)
        console.log("assigning new peer to location in room ", peerLoc)
        peerLocations[peerId.toString()] = peerLoc

        roomStates[peerLoc].peers[peerId] = {
          joinTs: now,
          lastSeenTs: now,
          media: {},
          consumerLayers: {},
          stats: {}
        }

        callback({ routerRtpCapabilities: routers[peerLoc].rtpCapabilities })
      } catch (e) {
        console.error("error in /signaling/join-as-new-peer", e)
        callback({ error: e })
      }
    })

    // --> /signaling/leave
    //
    // removes the peer from the roomState data structure and and closes
    // all associated mediasoup objects
    //
    socket.on("leave", async (data, callback) => {
      try {
        // let { peerId } = req.body;
        let peerId = socket.id
        console.log("leave", peerId)

        await closePeer(peerId)
        callback({ left: true })
      } catch (e) {
        console.error("error in /signaling/leave", e)
        callback({ error: e })
      }
    })

    // --> /signaling/create-transport
    //
    // create a mediasoup transport object and send back info needed
    // to create a transport object on the client side
    //
    socket.on("create-transport", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]
        // let { peerId, direction } = req.body;
        let { direction } = data
        console.log("create-transport", peerId, direction)

        let transport = await createWebRtcTransport({ peerId, direction })
        roomStates[peerLoc].transports[transport.id] = transport

        let { id, iceParameters, iceCandidates, dtlsParameters } = transport
        callback({
          transportOptions: {
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
          }
        })
      } catch (e) {
        console.error("error in /signaling/create-transport", e)
        callback({ error: e })
      }
    })

    // --> /signaling/connect-transport
    //
    // called from inside a client's `transport.on('connect')` event
    // handler.
    //
    socket.on("connect-transport", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        // let { peerId, transportId, dtlsParameters } = req.body,
        let { transportId, dtlsParameters } = data,
          transport = roomStates[peerLoc].transports[transportId]

        if (!transport) {
          console.err(`connect-transport: server-side transport ${transportId} not found`)
          callback({ error: `server-side transport ${transportId} not found` })
          return
        }

        console.log("connect-transport", peerId, transport.appData)

        await transport.connect({ dtlsParameters })
        callback({ connected: true })
      } catch (e) {
        console.error("error in /signaling/connect-transport", e)
        callback({ error: e })
      }
    })

    // --> /signaling/close-transport
    //
    // called by a client that wants to close a single transport (for
    // example, a client that is no longer sending any media).
    //
    socket.on("close-transport", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        // let { peerId, transportId } = req.body,
        let { transportId } = data
        transport = roomStates[peerLoc].transports[transportId]

        if (!transport) {
          console.err(`close-transport: server-side transport ${transportId} not found`)
          callback({ error: `server-side transport ${transportId} not found` })
          return
        }

        console.log("close-transport", peerId, transport.appData)

        await closeTransport(transport, peerId)
        callback({ closed: true })
      } catch (e) {
        console.error("error in /signaling/close-transport", e)
        callback({ error: e.message })
      }
    })

    // --> /signaling/close-producer
    //
    // called by a client that is no longer sending a specific track
    //
    socket.on("close-producer", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        // let { peerId, producerId } = req.body,
        let { producerId } = data,
          producer = roomStates[peerLoc].producers.find(p => p.id === producerId)

        if (!producer) {
          console.err(`close-producer: server-side producer ${producerId} not found`)
          callback({ error: `server-side producer ${producerId} not found` })
          return
        }

        console.log("close-producer", peerId, producer.appData)

        // await closeProducer(producer, peerId);
        await closeProducerAndAllPipeProducers(producer, peerId)

        callback({ closed: true })
      } catch (e) {
        console.error(e)
        callback({ error: e.message })
      }
    })

    // --> /signaling/send-track
    //
    // called from inside a client's `transport.on('produce')` event handler.
    //
    socket.on("send-track", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        // let { peerId, transportId, kind, rtpParameters,
        let { transportId, kind, rtpParameters, paused = false, appData } = data,
          transport = roomStates[peerLoc].transports[transportId]

        if (!transport) {
          console.err(`send-track: server-side transport ${transportId} not found`)
          callback({ error: `server-side transport ${transportId} not found` })
          return
        }

        let producer = await transport.produce({
          kind,
          rtpParameters,
          paused,
          appData: { ...appData, peerId, transportId }
        })

        // log("ID: ", peerId);
        // log("ProducerID: ",producer.id);
        // log(roomStates[peerLoc]);

        // pipe to all other routers
        console.log("Cloning Producer with ID: ", producer.id, " from peer with id ", producer.appData.peerId)
        for (let i = 0; i < numCPUs; i++) {
          if (i == peerLoc) {
            continue
          } else {
            let { pipeProducer } = await routers[peerLoc].pipeToRouter({
              producerId: producer.id,
              router: routers[i]
            })
            // await routers[peerLoc].pipeToRouter({ producerId: peerId, router: routers[i] })
            roomStates[i].producers.push(pipeProducer)
            console.log("Adding pipeProducer with id:", pipeProducer.id, " from peer with id ", producer.appData.peerId, " to room # ", i)
          }
        }

        // if our associated transport closes, close ourself, too
        producer.on("transportclose", () => {
          console.log("producer's transport closed", producer.id)
          closeProducerAndAllPipeProducers(producer, peerId)
          // closeProducer(producer, peerId);
        })

        // monitor audio level of this producer. we call addProducer() here,
        // but we don't ever need to call removeProducer() because the core
        // AudioLevelObserver code automatically removes closed producers
        // if (producer.kind === 'audio') {
        //   audioLevelObservers[peerLoc].addProducer({ producerId: producer.id });
        // }

        roomStates[peerLoc].producers.push(producer)
        roomStates[peerLoc].peers[peerId].media[appData.mediaTag] = {
          paused,
          encodings: rtpParameters.encodings
        }

        callback({ id: producer.id })
      } catch (e) {}
    })

    // --> /signaling/recv-track
    //
    // create a mediasoup consumer object, hook it up to a producer here
    // on the server side, and send back info needed to create a consumer
    // object on the client side. always start consumers paused. client
    // will request media to resume when the connection completes
    //
    socket.on("recv-track", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { mediaPeerId, mediaTag, rtpCapabilities } = data

        let producer = roomStates[peerLoc].producers.find(p => p.appData.mediaTag === mediaTag && p.appData.peerId === mediaPeerId)

        if (!producer) {
          let msg = "server-side producer for " + `${mediaPeerId}:${mediaTag} not found`
          console.err("recv-track: " + msg)
          callback({ error: msg })
          return
        }

        if (
          !routers[peerLoc].canConsume({
            producerId: producer.id,
            rtpCapabilities
          })
        ) {
          let msg = `client cannot consume ${mediaPeerId}:${mediaTag}`
          console.err(`recv-track: ${peerId} ${msg}`)
          callback({ error: msg })
          return
        }

        let transport = Object.values(roomStates[peerLoc].transports).find(t => t.appData.peerId === peerId && t.appData.clientDirection === "recv")

        if (!transport) {
          let msg = `server-side recv transport for ${peerId} not found`
          console.err("recv-track: " + msg)
          callback({ error: msg })
          return
        }

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
        roomStates[peerLoc].consumers.push(consumer)
        roomStates[peerLoc].peers[peerId].consumerLayers[consumer.id] = {
          currentLayer: null,
          clientSelectedLayer: null
        }

        // update above data structure when layer changes.
        consumer.on("layerschange", layers => {
          console.log(`consumer layerschange ${mediaPeerId}->${peerId}`, mediaTag, layers)
          if (roomStates[peerLoc].peers[peerId] && roomStates[peerLoc].peers[peerId].consumerLayers[consumer.id]) {
            roomStates[peerLoc].peers[peerId].consumerLayers[consumer.id].currentLayer = layers && layers.spatialLayer
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
      } catch (e) {
        console.error("error in /signaling/recv-track", e)
        callback({ error: e })
      }
    })

    // --> /signaling/pause-consumer
    //
    // called to pause receiving a track for a specific client
    //
    socket.on("pause-consumer", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { consumerId } = data,
          consumer = roomStates[peerLoc].consumers.find(c => c.id === consumerId)

        if (!consumer) {
          console.err(`pause-consumer: server-side consumer ${consumerId} not found`)
          callback({ error: `server-side producer ${consumerId} not found` })
          return
        }

        console.log("pause-consumer", consumer.appData)

        await consumer.pause()

        callback({ paused: true })
      } catch (e) {
        console.error("error in /signaling/pause-consumer", e)
        callback({ error: e })
      }
    })

    // --> /signaling/resume-consumer
    //
    // called to resume receiving a track for a specific client
    //
    socket.on("resume-consumer", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { consumerId } = data,
          consumer = roomStates[peerLoc].consumers.find(c => c.id === consumerId)

        if (!consumer) {
          console.err(`pause-consumer: server-side consumer ${consumerId} not found`)
          callback({ error: `server-side consumer ${consumerId} not found` })
          return
        }

        console.log("resume-consumer", consumer.appData)

        await consumer.resume()

        callback({ resumed: true })
      } catch (e) {
        console.error("error in /signaling/resume-consumer", e)
        callback({ error: e })
      }
    })

    // --> /signalign/close-consumer
    //
    // called to stop receiving a track for a specific client. close and
    // clean up consumer object
    //
    socket.on("close-consumer", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { consumerId } = data,
          consumer = roomStates[peerLoc].consumers.find(c => c.id === consumerId)

        if (!consumer) {
          console.err(`close-consumer: server-side consumer ${consumerId} not found`)
          callback({ error: `server-side consumer ${consumerId} not found` })
          return
        }

        await closeConsumer(consumer, peerId)

        callback({ closed: true })
      } catch (e) {
        console.error("error in /signaling/close-consumer", e)
        callback({ error: e })
      }
    })

    // --> /signaling/consumer-set-layers
    //
    // called to set the largest spatial layer that a specific client
    // wants to receive
    //
    socket.on("consumer-set-layers", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { consumerId, spatialLayer } = data,
          consumer = roomStates[peerLoc].consumers.find(c => c.id === consumerId)

        if (!consumer) {
          console.err(`consumer-set-layers: server-side consumer ${consumerId} not found`)
          callback({ error: `server-side consumer ${consumerId} not found` })
          return
        }

        console.log("consumer-set-layers", spatialLayer, consumer.appData)

        await consumer.setPreferredLayers({ spatialLayer })

        callback({ layersSet: true })
      } catch (e) {
        console.error("error in /signaling/consumer-set-layers", e)
        callback({ error: e })
      }
    })

    // --> /signaling/pause-producer
    //
    // called to stop sending a track from a specific client
    //
    socket.on("pause-producer", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { producerId } = data,
          producer = roomStates[peerLoc].producers.find(p => p.id === producerId)

        if (!producer) {
          console.err(`pause-producer: server-side producer ${producerId} not found`)
          callback({ error: `server-side producer ${producerId} not found` })
          return
        }

        console.log("pause-producer", producer.appData)

        await producer.pause()

        roomStates[peerLoc].peers[peerId].media[producer.appData.mediaTag].paused = true

        callback({ paused: true })
      } catch (e) {
        console.error("error in /signaling/pause-producer", e)
        callback({ error: e })
      }
    })

    // --> /signaling/resume-producer
    //
    // called to resume sending a track from a specific client
    //
    socket.on("resume-producer", async (data, callback) => {
      try {
        let peerId = socket.id
        let peerLoc = peerLocations[peerId.toString()]

        let { producerId } = data,
          producer = roomStates[peerLoc].producers.find(p => p.id === producerId)

        if (!producer) {
          console.err(`resume-producer: server-side producer ${producerId} not found`)
          callback({ error: `server-side producer ${producerId} not found` })
          return
        }

        console.log("resume-producer", producer.appData)

        await producer.resume()

        roomStates[peerLoc].peers[peerId].media[producer.appData.mediaTag].paused = false

        callback({ resumed: true })
      } catch (e) {
        console.error("error in /signaling/resume-producer", e)
        callback({ error: e })
      }
    })

    //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
    //*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//*//
  })
}

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

//
// start mediasoup with a single worker and router
//

async function startMediasoup() {
  let roomState = {
    // external
    peers: {},
    activeSpeaker: { producerId: null, volume: null, peerId: null },
    // internal
    transports: {},
    producers: [],
    consumers: []
  }

  let worker = await mediasoup.createWorker({
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
  const router = await worker.createRouter({ mediaCodecs })

  // audioLevelObserver for signaling active speaker
  //
  // const audioLevelObserver = await router.createAudioLevelObserver({
  //   interval: 800
  // });
  // audioLevelObserver.on('volumes', (volumes) => {
  //   const { producer, volume } = volumes[0];
  //   log('audio-level volumes event', producer.appData.peerId, volume);
  //   roomState.activeSpeaker.producerId = producer.id;
  //   roomState.activeSpeaker.volume = volume;
  //   roomState.activeSpeaker.peerId = producer.appData.peerId;
  // });
  // audioLevelObserver.on('silence', () => {
  //   log('audio-level silence event');
  //   roomState.activeSpeaker.producerId = null;
  //   roomState.activeSpeaker.volume = null;
  //   roomState.activeSpeaker.peerId = null;
  // });

  return { worker, router, roomState }
}

function closePeer(peerId) {
  console.log("closing peer", peerId)
  let peerLoc = peerLocations[peerId.toString()]
  for (let [id, transport] of Object.entries(roomStates[peerLoc].transports)) {
    if (transport.appData.peerId === peerId) {
      closeTransport(transport, peerId)
    }
  }
  delete roomStates[peerLoc].peers[peerId]
}

async function closeTransport(transport, peerId) {
  try {
    let peerLoc = peerLocations[peerId.toString()]
    console.log("closing transport", transport.id, transport.appData)

    // our producer and consumer event handlers will take care of
    // calling closeProducer() and closeConsumer() on all the producers
    // and consumers associated with this transport
    await transport.close()

    // so all we need to do, after we call transport.close(), is update
    // our roomState data structure
    delete roomStates[peerLoc].transports[transport.id]
  } catch (e) {
    console.err(e)
  }
}

// async function closeProducer(producer, peerId) {
//   log('closing producer', producer.id, producer.appData);
//   try {
//     let peerLoc = peerLocations[peerId.toString()];
//     await producer.close();

//     // remove this producer from our roomState.producers list
//     roomStates[peerLoc].producers = roomStates[peerLoc].producers
//       .filter((p) => p.id !== producer.id);

//     // remove this track's info from our roomState...mediaTag bookkeeping
//     if (roomStates[peerLoc].peers[producer.appData.peerId]) {
//       delete (roomStates[peerLoc].peers[producer.appData.peerId]
//         .media[producer.appData.mediaTag]);
//     }
//   } catch (e) {
//     console.err(e);
//   }
// }

async function closeProducerAndAllPipeProducers(producer, peerId) {
  console.log("closing producer", producer.id, producer.appData)
  try {
    let peerLoc = peerLocations[peerId.toString()]

    // first, close all of the pipe producer clones
    console.log("Closing all pipe producers for peer with id", peerId)
    for (let i = 0; i < roomStates.length; i++) {
      if (i == peerLoc) {
        continue // we'll deal with this one later
      } else {
        // remove this producer from our roomState.producers list
        console.log("Closing pipe producer in room ", i)
        roomStates[i].producers = roomStates[i].producers.filter(p => p.id !== producer.id)
      }
    }

    // finally, close the original producer
    await producer.close()

    // remove this producer from our roomState.producers list
    roomStates[peerLoc].producers = roomStates[peerLoc].producers.filter(p => p.id !== producer.id)

    // remove this track's info from our roomState...mediaTag bookkeeping
    if (roomStates[peerLoc].peers[producer.appData.peerId]) {
      delete roomStates[peerLoc].peers[producer.appData.peerId].media[producer.appData.mediaTag]
    }
  } catch (e) {
    console.err(e)
  }
}

async function closeConsumer(consumer, peerId) {
  console.log("closing consumer", consumer.id, consumer.appData)
  let peerLoc = peerLocations[peerId.toString()]
  await consumer.close()

  // remove this consumer from our roomState.consumers list
  roomStates[peerLoc].consumers = roomStates[peerLoc].consumers.filter(c => c.id !== consumer.id)

  // remove layer info from from our roomState...consumerLayers bookkeeping
  if (roomStates[peerLoc].peers[consumer.appData.peerId]) {
    delete roomStates[peerLoc].peers[consumer.appData.peerId].consumerLayers[consumer.id]
  }
}

async function createWebRtcTransport({ peerId, direction }) {
  let peerLoc = peerLocations[peerId.toString()]
  const { listenIps, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport

  const transport = await routers[peerLoc].createWebRtcTransport({
    listenIps: listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerId, clientDirection: direction }
  })

  return transport
}

//
// stats
//

// async function updatePeerStats() {
//   for (let i = 0; i < roomStates.length; i++) {
//     let roomState = roomStates[i];
//     for (let producer of roomState.producers) {
//       if (producer.kind !== 'video') {
//         continue;
//       }
//       try {
//         let stats = await producer.getStats(),
//           peerId = producer.appData.peerId;
//         roomState.peers[peerId].stats[producer.id] = stats.map((s) => ({
//           bitrate: s.bitrate,
//           fractionLost: s.fractionLost,
//           jitter: s.jitter,
//           score: s.score,
//           rid: s.rid
//         }));
//       } catch (e) {
//         console.log('error while updating producer stats', e);
//       }
//     }

//     for (let consumer of roomState.consumers) {
//       try {
//         let stats = (await consumer.getStats())
//           .find((s) => s.type === 'outbound-rtp'),
//           peerId = consumer.appData.peerId;
//         if (!stats || !roomState.peers[peerId]) {
//           continue;
//         }
//         roomState.peers[peerId].stats[consumer.id] = {
//           bitrate: stats.bitrate,
//           fractionLost: stats.fractionLost,
//           score: stats.score
//         }
//       } catch (e) {
//         console.log('error while updating consumer stats', e);
//       }
//     }
//   }
// }
