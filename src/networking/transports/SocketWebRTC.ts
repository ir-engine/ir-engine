/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as mediasoup from "mediasoup-client"

import { webcamState } from "./WebcamState"
import NetworkTransport from "../interfaces/NetworkTransport"
import io from "socket.io-client"
import promise from "socket.io-promise"

// adding constraints, VIDEO_CONSTRAINTS is video quality levels
// localMediaCOnstraints is passed to the getUserMedia object to request a lower video quality than the maximum
// I believe some webcam settings may override this request

const VIDEO_CONSTRAINTS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } }
}
const localMediaConstraints = {
  audio: true,
  video: {
    width: VIDEO_CONSTRAINTS.qvga.width,
    height: VIDEO_CONSTRAINTS.qvga.height,
    frameRate: { max: 30 }
  }
}

export default class SocketWebRTCTransport implements NetworkTransport {
  clients = {}
  mySocketID
  socket
  device
  joined
  localCam
  localScreen
  recvTransport
  sendTransport
  camVideoProducer
  camAudioProducer
  screenVideoProducer
  screenAudioProducer
  lastPollSyncData = {}
  // currentActiveSpeaker = {},
  consumers = []
  pollingInterval
  screenShareVideoPaused = false
  screenShareAudioPaused = false
  worldScene
  initialized = false

  public initialize(initializationCallback: any) {
    this.init(initializationCallback)
  }

  private async init(initializationCallback: any) {
    this.socket = io()
    //TODO: const scene = createScene()
    const getClients = () => this.clients

    // create mediasoup Device
    try {
      this.device = new mediasoup.Device()
    } catch (e) {
      if (e.name === "UnsupportedError") {
        console.error("browser not supported for video calls")
        return
      }
      console.error(e)
    }

    this.initSocketConnection()

    // use sendBeacon to tell the server we're disconnecting when
    // the page unloads
    window.addEventListener("unload", () => {
      this.socket.request("leave", {})
      // sig('leave', {}, true)
    })

    //@ts-ignore
    window.screenshare = this.startScreenshare

    alert("Access camera for full experience")
    await this.startCamera()

    //TODO: const startButton = document.getElementById("startButton")
    //TODO: startButton.addEventListener("click", init)
    //TODO: worldScene.initializeAudio()
    //TODO: worldScene.controls.lock()

    // only join room after we user has interacted with DOM (to ensure that media elements play)
    if (!this.initialized) {
      await this.joinRoom()
      this.sendCameraStreams()
      //TODO: setupControls()
      this.initialized = true
      console.log("jointed")
      initializationCallback()
    }
  }

  // Adds client object with THREE.js object, DOM video object and and an RTC peer connection for each :
  async addClient(_id) {
    console.log(`Adding client with id ${_id}`)
    this.clients[_id] = {}
    this.worldScene.addClient(_id)
  }

  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
  // Socket.io
  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

  // establishes socket connection
  // uses promise to ensure that we receive our so
  initSocketConnection() {
    return new Promise(resolve => {
      const {
        location: { hostname }
      } = window
      console.log(`Initializing socket.io..., on host ${hostname} and port: ${process.env.SERVER_PORT}`)
      this.socket.request = promise(this.socket)

      this.socket.on("connect", () => {
        console.log("Connected")
      })

      // On connection server sends the client his ID and a list of all keys
      this.socket.on("introduction", (_id, _ids) => {
        // keep a local copy of my ID:
        console.log(`My socket ID is: ${_id}`)
        this.mySocketID = _id

        // for each existing user, add them as a client and add tracks to their peer connection
        for (let i = 0; i < _ids.length; i++) {
          if (_ids[i] !== this.mySocketID) {
            this.addClient(_ids[i])
          }
        }
        resolve()
      })

      // when a new user has entered the server
      this.socket.on("newUserConnected", (clientCount, _id) => {
        console.log(`${clientCount} clients connected`)

        if (!(_id in this.clients)) {
          if (_id !== this.mySocketID) {
            console.log(`A new user connected with the id: ${_id}`)
            this.addClient(_id)
          }
        }
      })

      this.socket.on("userDisconnected", _id => {
        // Update the data from the server

        if (_id in this.clients) {
          if (_id === this.mySocketID) {
            console.log("Uh oh!  The server thinks we disconnected!")
          } else {
            console.log(`A user disconnected with the id: ${_id}`)
            this.worldScene.removeClient(_id)
            this.removeClientDOMElements(_id)
            delete this.clients[_id]
          }
        }
      })

      // Update when one of the users moves in space
      this.socket.on("userPositions", _clientProps => {
        this.worldScene.updateClientPositions(_clientProps)
      })
    })
  }

  // remove <video> element and corresponding <canvas> using client ID
  removeClientDOMElements(_id) {
    console.log(`Removing DOM elements for client with ID: ${_id}`)

    const videoEl = document.getElementById(`${_id}_video`)
    if (videoEl !== null) {
      videoEl.remove()
    }
    const canvasEl = document.getElementById(`${_id}_canvas`)
    if (canvasEl !== null) {
      canvasEl.remove()
    }
    const audioEl = document.getElementById(`${_id}_audio`)
    if (audioEl !== null) {
      audioEl.remove()
    }
  }

  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
  // Mediasoup Code:
  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

  //
  // meeting control actions
  //

  async joinRoom() {
    if (this.joined) {
      return
    }
    console.log("join room")

    try {
      // signal that we're a new peer and initialize our
      // mediasoup-client device, if this is our first time connecting
      const resp = await this.socket.request("join-as-new-peer")
      const { routerRtpCapabilities } = resp
      if (!this.device.loaded) {
        await this.device.load({ routerRtpCapabilities })
      }
      this.joined = true
    } catch (e) {
      console.error(e)
      return
    }

    await this.pollAndUpdate() // start this polling loop
  }

  async sendCameraStreams() {
    console.log("send camera streams")

    // make sure we've joined the room and started our camera. these
    // functions don't do anything if they've already been called this
    // session

    await this.joinRoom()
    await this.startCamera()

    // create a transport for outgoing media, if we don't already have one
    if (!this.sendTransport) {
      this.sendTransport = await this.createTransport("send")
    }

    // start sending video. the transport logic will initiate a
    // signaling conversation with the server to set up an outbound rtp
    // stream for the camera video track. our createTransport() function
    // includes logic to tell the server to start the stream in a paused
    // state, if the checkbox in our UI is unchecked. so as soon as we
    // have a client-side camVideoProducer object, we need to set it to
    // paused as appropriate, too.
    if (this.localCam) {
      this.camVideoProducer = await this.sendTransport.produce({
        track: this.localCam.getVideoTracks()[0],
        encodings: this.camEncodings(),
        appData: { mediaTag: "cam-video" }
      })

      if (webcamState.videoPaused) {
        try {
          await this.camVideoProducer.pause()
        } catch (e) {
          console.error(e)
        }
      }

      // same thing for audio, but we can use our already-created
      this.camAudioProducer = await this.sendTransport.produce({
        track: this.localCam.getAudioTracks()[0],
        appData: { mediaTag: "cam-audio" }
      })

      if (webcamState.audioPaused) {
        try {
          this.camAudioProducer.pause()
        } catch (e) {
          console.error(e)
        }
      }
    }
  }

  async startScreenshare() {
    console.log("start screen share")

    // make sure we've joined the room and that we have a sending
    // transport
    await this.joinRoom()
    if (!this.sendTransport) {
      this.sendTransport = await this.createTransport("send")
    }

    // get a screen share track
    // @ts-ignore
    this.localScreen = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })

    // create a producer for video
    this.screenVideoProducer = await this.sendTransport.produce({
      track: this.localScreen.getVideoTracks()[0],
      encodings: this.screenshareEncodings(),
      appData: { mediaTag: "screen-video" }
    })

    // create a producer for audio, if we have it
    if (this.localScreen.getAudioTracks().length) {
      this.screenAudioProducer = await this.sendTransport.produce({
        track: this.localScreen.getAudioTracks()[0],
        appData: { mediaTag: "screen-audio" }
      })
    }

    // handler for screen share stopped event (triggered by the
    // browser's built-in screen sharing ui)
    this.screenVideoProducer.track.onended = async () => {
      console.log("screen share stopped")
      try {
        await this.screenVideoProducer.pause()

        const { error } = await this.socket.request("close-producer", {
          producerId: this.screenVideoProducer.id
        })
        await this.screenVideoProducer.close()
        this.screenVideoProducer = null
        if (error) {
          console.error(error)
        }
        if (this.screenAudioProducer) {
          const { error: screenAudioProducerError } = await this.socket.request("close-producer", {
            producerId: this.screenAudioProducer.id
          })
          await this.screenAudioProducer.close()
          this.screenAudioProducer = null
          if (screenAudioProducerError) {
            console.error(screenAudioProducerError)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  async startCamera() {
    if (this.localCam) {
      return
    }
    console.log("start camera")
    try {
      this.localCam = await navigator.mediaDevices.getUserMedia(localMediaConstraints)
      webcamState.audioPaused = false
      webcamState.videoPaused = false
    } catch (e) {
      console.error("Start camera error", e)
      webcamState.audioPaused = true
      webcamState.videoPaused = true
    }
  }

  // switch to sending video from the "next" camera device in our device
  // list (if we have multiple cameras)
  async cycleCamera() {
    if (!(this.camVideoProducer && this.camVideoProducer.track)) {
      console.log("cannot cycle camera - no current camera track")
      return
    }

    console.log("cycle camera")

    // find "next" device in device list
    const deviceId = await this.getCurrentDeviceId()
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const vidDevices = allDevices.filter(d => d.kind === "videoinput")
    if (!(vidDevices.length > 1)) {
      console.log("cannot cycle camera - only one camera")
      return
    }
    let idx = vidDevices.findIndex(d => d.deviceId === deviceId)
    if (idx === vidDevices.length - 1) {
      idx = 0
    } else {
      idx += 1
    }

    // get a new video stream. might as well get a new audio stream too,
    // just in case browsers want to group audio/video streams together
    // from the same device when possible (though they don't seem to,
    // currently)
    console.log("getting a video stream from new device", vidDevices[idx].label)
    this.localCam = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: vidDevices[idx].deviceId } },
      audio: true
    })

    // replace the tracks we are sending
    await this.camVideoProducer.replaceTrack({ track: this.localCam.getVideoTracks()[0] })
    await this.camAudioProducer.replaceTrack({ track: this.localCam.getAudioTracks()[0] })
  }
  async stopStreams() {
    if (!(this.localCam || this.localScreen)) {
      return
    }
    if (!this.sendTransport) {
      return
    }

    console.log("stop sending media streams")
    // $('#stop-streams').style.display = 'none';

    const { error } = await this.socket.request("close-transport", {
      transportId: this.sendTransport.id
    })
    if (error) {
      console.error(error)
    }
    // closing the sendTransport closes all associated producers. when
    // the camVideoProducer and camAudioProducer are closed,
    // mediasoup-client stops the local cam tracks, so we don't need to
    // do anything except set all our local variables to null.
    try {
      await this.sendTransport.close()
    } catch (e) {
      console.error(e)
    }
    this.sendTransport = null
    this.camVideoProducer = null
    this.camAudioProducer = null
    this.screenVideoProducer = null
    this.screenAudioProducer = null
    this.localCam = null
    this.localScreen = null
  }

  async leaveRoom() {
    if (!this.joined) {
      return
    }

    console.log("leave room")

    // stop polling
    clearInterval(this.pollingInterval)

    // close everything on the server-side (transports, producers, consumers)
    const { error } = await this.socket.request("leave")
    if (error) {
      console.error(error)
    }

    // closing the transports closes all producers and consumers. we
    // don't need to do anything beyond closing the transports, except
    // to set all our local variables to their initial states
    try {
      if (this.recvTransport) await this.recvTransport.close()
      if (this.sendTransport) await this.sendTransport.close()
    } catch (e) {
      console.error(e)
    }
    this.recvTransport = null
    this.sendTransport = null
    this.camVideoProducer = null
    this.camAudioProducer = null
    this.screenVideoProducer = null
    this.screenAudioProducer = null
    this.localCam = null
    this.localScreen = null
    this.lastPollSyncData = {}
    this.consumers = []
    this.joined = false
  }

  async subscribeToTrack(peerId, mediaTag) {
    console.log("subscribe to track", peerId, mediaTag)

    // create a receive transport if we don't already have one
    if (!this.recvTransport) {
      this.recvTransport = await this.createTransport("recv")
    }

    // if we do already have a consumer, we shouldn't have called this
    // method
    let consumer = this.findConsumerForTrack(peerId, mediaTag)
    if (consumer) {
      console.error("already have consumer for track", peerId, mediaTag)
      return
    }

    // ask the server to create a server-side consumer object and send
    // us back the info we need to create a client-side consumer

    const consumerParameters = await this.socket.request("recv-track", {
      mediaTag,
      mediaPeerId: peerId,
      rtpCapabilities: this.device.rtpCapabilities
    })
    console.log("consumer parameters", consumerParameters)
    consumer = await this.recvTransport.consume({
      ...consumerParameters,
      appData: { peerId, mediaTag }
    })
    console.log("created new consumer", consumer.id)

    // the server-side consumer will be started in paused state. wait
    // until we're connected, then send a resume request to the server
    // to get our first keyframe and start displaying video
    while (this.recvTransport.connectionState !== "connected") {
      console.log("  transport connstate", this.recvTransport.connectionState)
      await this.sleep(100)
    }
    // okay, we're ready. let's ask the peer to send us media
    await this.resumeConsumer(consumer)

    // keep track of all our consumers
    this.consumers.push(consumer)

    // ui
    await this.addVideoAudio(consumer, peerId)
  }

  async unsubscribeFromTrack(peerId, mediaTag) {
    const consumer = this.findConsumerForTrack(peerId, mediaTag)
    if (!consumer) {
      return
    }

    console.log("unsubscribe from track", peerId, mediaTag)
    try {
      await this.closeConsumer(consumer)
    } catch (e) {
      console.error(e)
    }
  }

  // TODO check these functions
  async pauseAllConsumersForPeer(_id) {
    if (this.lastPollSyncData[_id]) {
      if (!(_id === this.mySocketID)) {
        for (const [mediaTag, _] of Object.entries(this.lastPollSyncData[_id].media)) {
          const consumer = this.findConsumerForTrack(_id, mediaTag)
          if (consumer) {
            if (!consumer.paused) {
              console.log("Pausing", mediaTag, `consumer for peer with ID: ${_id}`)
              await this.pauseConsumer(consumer)
            }
          }
        }
      }
    }
  }

  async resumeAllConsumersForPeer(_id) {
    if (this.lastPollSyncData[_id]) {
      if (!(_id === this.mySocketID)) {
        for (const [mediaTag, _] of Object.entries(this.lastPollSyncData[_id].media)) {
          const consumer = this.findConsumerForTrack(_id, mediaTag)
          if (consumer) {
            if (consumer.paused) {
              console.log("Resuming", mediaTag, `consumer for peer with ID: ${_id}`)
              await this.resumeConsumer(consumer)
            }
          }
        }
      }
    }
  }

  async pauseConsumer(consumer) {
    if (consumer) {
      console.log("pause consumer", consumer.appData.peerId, consumer.appData.mediaTag)
      try {
        await this.socket.request("pause-consumer", { consumerId: consumer.id })
        await consumer.pause()
      } catch (e) {
        console.error(e)
      }
    }
  }

  async resumeConsumer(consumer) {
    if (consumer) {
      console.log("resume consumer", consumer.appData.peerId, consumer.appData.mediaTag)
      try {
        await this.socket.request("resume-consumer", { consumerId: consumer.id })
        await consumer.resume()
      } catch (e) {
        console.error(e)
      }
    }
  }

  async pauseProducer(producer) {
    if (producer) {
      console.log("pause producer", producer.appData.mediaTag)
      try {
        await this.socket.request("pause-producer", { producerId: producer.id })
        await producer.pause()
      } catch (e) {
        console.error(e)
      }
    }
  }

  async resumeProducer(producer) {
    if (producer) {
      console.log("resume producer", producer.appData.mediaTag)
      try {
        await this.socket.request("resume-producer", { producerId: producer.id })

        await producer.resume()
      } catch (e) {
        console.error(e)
      }
    }
  }

  async closeConsumer(consumer) {
    if (!consumer) {
      return
    }
    console.log("closing consumer", consumer.appData.peerId, consumer.appData.mediaTag)
    try {
      // tell the server we're closing this consumer. (the server-side
      // consumer may have been closed already, but that's okay.)
      await this.socket.request("close-consumer", { consumerId: consumer.id })
      await consumer.close()

      this.consumers = this.consumers.filter(c => c !== consumer)
      this.removeVideoAudio(consumer)
    } catch (e) {
      console.error(e)
    }
  }

  // utility function to create a transport and hook up signaling logic
  // appropriate to the transport's direction
  //
  async createTransport(direction) {
    console.log(`create ${direction} transport`)

    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport
    const { transportOptions } = await this.socket.request("create-transport", {
      direction
    })
    console.log("transport options", transportOptions)

    if (direction === "recv") {
      transport = await this.device.createRecvTransport(transportOptions)
    } else if (direction === "send") {
      transport = await this.device.createSendTransport(transportOptions)
    } else {
      throw new Error(`bad transport 'direction': ${direction}`)
    }

    // mediasoup-client will emit a connect event when media needs to
    // start flowing for the first time. send dtlsParameters to the
    // server, then call callback() on success or errback() on failure.
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      console.log("transport connect event", direction)

      const { error } = await this.socket.request("connect-transport", {
        transportId: transportOptions.id,
        dtlsParameters
      })
      if (error) {
        console.error("error connecting transport", direction, error)
        errback()
        return
      }
      callback()
    })

    if (direction === "send") {
      // sending transports will emit a produce event when a new track
      // needs to be set up to start sending. the producer's appData is
      // passed as a parameter
      transport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
        console.log("transport produce event", appData.mediaTag)
        // we may want to start out paused (if the checkboxes in the ui
        // aren't checked, for each media type. not very clean code, here
        // but, you know, this isn't a real application.)
        let paused = false
        if (appData.mediaTag === "cam-video") {
          paused = webcamState.videoPaused
        } else if (appData.mediaTag === "cam-audio") {
          paused = webcamState.audioPaused
        }
        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.

        const { error, id } = await this.socket.request("send-track", {
          transportId: transportOptions.id,
          kind,
          rtpParameters,
          paused,
          appData
        })
        if (error) {
          console.error("error setting up server-side producer", error)
          errback()
          return
        }
        callback({ id })
      })
    }

    // for this simple demo, any time a transport transitions to closed,
    // failed, or disconnected, leave the room and reset
    //
    transport.on("connectionstatechange", async state => {
      console.log(`transport ${transport.id} connectionstatechange ${state}`)
      // for this simple sample code, assume that transports being
      // closed is an error (we never close these transports except when
      // we leave the room)
      if (state === "closed" || state === "failed" || state === "disconnected") {
        console.log("transport closed ... leaving the room and resetting")
        // leaveRoom();
        alert("Your connection failed.  Please restart the page")
      }
    })

    return transport
  }

  //
  // polling/update logic
  //

  async pollAndUpdate() {
    console.log("Polling server for current peers array!")
    const { peers, error } = await this.socket.request("sync")

    if (error) {
      console.error("PollAndUpdateError: ", error)
    }

    if (!(this.mySocketID in peers)) {
      console.log("Server doesn't think you're connected!")
    }

    // decide if we need to update tracks list and video/audio
    // elements. build list of peers, sorted by join time, removing last
    // seen time and stats, so we can easily do a deep-equals
    // comparison. compare this list with the cached list from last
    // poll.

    // auto-subscribe to their feeds:
    // TODO auto subscribe at lowest spatial layer
    const closestPeers = this.worldScene.getClosestPeers()
    for (const id in peers) {
      // for each peer...
      if (id !== this.mySocketID) {
        // if it isnt me...
        if (closestPeers.includes(id)) {
          // and if it is close enough in the 3d space...
          for (const [mediaTag, _] of Object.entries(peers[id].media)) {
            // for each of the peer's producers...
            if (!this.findConsumerForTrack(id, mediaTag)) {
              // that we don't already have consumers for...
              console.log(`auto subscribing to track that ${id} has added`)
              await this.subscribeToTrack(id, mediaTag)
            }
          }
        }
      }
    }

    // if a peer has gone away, we need to close all consumers we have
    // for that peer and remove video and audio elements
    for (const id in this.lastPollSyncData) {
      if (!peers[id]) {
        console.log(`Peer ${id} has exited`)
        this.consumers.forEach(consumer => {
          if (consumer.appData.peerId === id) {
            this.closeConsumer(consumer)
          }
        })
      }
    }

    // if a peer has stopped sending media that we are consuming, we
    // need to close the consumer and remove video and audio elements
    this.consumers.forEach(consumer => {
      const { peerId, mediaTag } = consumer.appData
      if (!peers[peerId]) {
        console.log(`Peer ${peerId} has stopped transmitting ${mediaTag}`)
        this.closeConsumer(consumer)
      } else if (!peers[peerId].media[mediaTag]) {
        console.log(`Peer ${peerId} has stopped transmitting ${mediaTag}`)
        this.closeConsumer(consumer)
      }
    })

    // push through the paused state to new sync list
    this.lastPollSyncData = peers

    setTimeout(this.pollAndUpdate, 1000)
  }

  findConsumerForTrack(peerId, mediaTag) {
    return this.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag)
  }

  //
  // -- user interface --
  //

  getScreenPausedState() {
    return this.screenShareVideoPaused
  }

  getScreenAudioPausedState() {
    return this.screenShareAudioPaused
  }

  async toggleWebcamVideoPauseState() {
    const videoPaused = webcamState.toggleVideoPaused()
    if (videoPaused) {
      this.pauseProducer(this.camVideoProducer)
    } else {
      this.resumeProducer(this.camVideoProducer)
    }
  }

  async toggleWebcamAudioPauseState() {
    const audioPaused = webcamState.toggleAudioPaused()
    if (audioPaused) {
      this.resumeProducer(this.camAudioProducer)
    } else {
      this.pauseProducer(this.camAudioProducer)
    }
  }

  async toggleScreenshareVideoPauseState() {
    if (this.getScreenPausedState()) {
      this.pauseProducer(this.screenVideoProducer)
    } else {
      this.resumeProducer(this.screenVideoProducer)
    }
    this.screenShareVideoPaused = !this.screenShareVideoPaused
  }

  async toggleScreenshareAudioPauseState() {
    if (this.getScreenAudioPausedState()) {
      this.pauseProducer(this.screenAudioProducer)
    } else {
      this.resumeProducer(this.screenAudioProducer)
    }
    this.screenShareAudioPaused = !this.screenShareAudioPaused
  }

  addVideoAudio(consumer, peerId) {
    if (!(consumer && consumer.track)) {
      return
    }
    const elementID = `${peerId}_${consumer.kind}`
    let el = document.getElementById(elementID)

    // set some attributes on our audio and video elements to make
    // mobile Safari happy. note that for audio to play you need to be
    // capturing from the mic/camera
    if (consumer.kind === "video") {
      if (el === null) {
        console.log(`Creating video element for user with ID: ${peerId}`)
        el = document.createElement("video")
        el.id = `${peerId}_${consumer.kind}`
        // @ts-ignore
        el.autoplay = true
        // @ts-ignore
        el.muted = true // necessary for
        // @ts-ignore
        el.style = "visibility: hidden;"
        document.body.appendChild(el)
        // @ts-ignore
        el.setAttribute("playsinline", true)
      }

      // TODO: do i need to update video width and height? or is that based on stream...?
      console.log(`Updating video source for user with ID: ${peerId}`)
      // @ts-ignore
      el.srcObject = new MediaStream([consumer.track.clone()])
      // @ts-ignore
      el.consumer = consumer

      // let's "yield" and return before playing, rather than awaiting on
      // play() succeeding. play() will not succeed on a producer-paused
      // track until the producer unpauses.
      // @ts-ignore
      el.play()
        .then(() => {})
        .catch(e => {
          console.log(`Play video error: ${e}`)
          console.error(e)
        })
    } else {
      // Positional Audio Works in Firefox:
      // Global Audio:
      if (el === null) {
        console.log(`Creating audio element for user with ID: ${peerId}`)
        el = document.createElement("audio")
        el.id = `${peerId}_${consumer.kind}`
        document.body.appendChild(el)
        // @ts-ignore
        el.setAttribute("playsinline", true)
        // @ts-ignore
        el.setAttribute("autoplay", true)
      }

      console.log(`Updating <audio> source object for client with ID: ${peerId}`)
      // @ts-ignore
      el.srcObject = new MediaStream([consumer.track.clone()])
      // @ts-ignore
      el.consumer = consumer
      // @ts-ignore
      el.volume = 0 // start at 0 and let the three.js scene take over from here...
      this.worldScene.createOrUpdatePositionalAudio(peerId)

      // let's "yield" and return before playing, rather than awaiting on
      // play() succeeding. play() will not succeed on a producer-paused
      // track until the producer unpauses.
      // @ts-ignore
      el.play()
        .then(() => {})
        .catch(e => {
          console.log(`Play audio error: ${e}`)
          console.error(e)
        })
    }
  }

  removeVideoAudio(consumer) {
    document.querySelectorAll(consumer.kind).forEach(v => {
      if (v.consumer === consumer) {
        v.parentNode.removeChild(v)
      }
    })
  }

  async getCurrentDeviceId() {
    if (!this.camVideoProducer) {
      return null
    }
    const { deviceId } = this.camVideoProducer.track.getSettings()
    if (deviceId) {
      return deviceId
    }
    // Firefox doesn't have deviceId in MediaTrackSettings object
    const track = this.localCam && this.localCam.getVideoTracks()[0]
    if (!track) {
      return null
    }
    const devices = await navigator.mediaDevices.enumerateDevices()
    const deviceInfo = devices.find(d => d.label.startsWith(track.label))
    return deviceInfo.deviceId
  }

  //
  // encodings for outgoing video
  //

  // just two resolutions, for now, as chrome 75 seems to ignore more
  // than two encodings
  //
  CAM_VIDEO_SIMULCAST_ENCODINGS = [
    { maxBitrate: 36000, scaleResolutionDownBy: 2 }
    // { maxBitrate: 96000, scaleResolutionDownBy: 2 },
    // { maxBitrate: 680000, scaleResolutionDownBy: 1 },
  ]

  camEncodings() {
    return this.CAM_VIDEO_SIMULCAST_ENCODINGS
  }

  // how do we limit bandwidth for screen share streams?
  //
  screenshareEncodings() {
    // null;
  }

  //
  // promisified sleep
  //

  async sleep(ms) {
    return new Promise(r => setTimeout(() => r(), ms))
  }
}
