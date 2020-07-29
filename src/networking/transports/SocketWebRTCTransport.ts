/* eslint-disable @typescript-eslint/ban-ts-comment */
import { webcamState } from "./WebcamState"
import Message from "../interfaces/Message"
import DataAudioVideoTransport from "../interfaces/DataAudioVideoTransport"
import io from "socket.io-client"
import { Device } from "mediasoup-client"
import { localMediaConstraints } from "./VIDEO_CONSTRAINTS"
import { promise } from "./promise"

// TODO: server connection goes here
const socket = io("https://localhost:3001")

let request: any

export default class SocketWebRTCTransport implements DataAudioVideoTransport {
  mediasoupDevice: Device
  joined: boolean
  localCam: MediaStream
  localScreen
  recvTransport
  sendTransport
  camVideoProducer
  camAudioProducer
  screenVideoProducer
  screenAudioProducer
  lastPollSyncData = {}
  consumers = []
  pollingInterval: NodeJS.Timeout
  screenShareVideoPaused = false
  screenShareAudioPaused = false
  initialized = false

  initializationCallback?: any
  setLocalConnectionIdCallback: any
  onConnectedCallback: any
  clientAddedCallback: any
  clientRemovedCallback: any
  getClosestPeersCallback: any
  getLocalConnectionIdCallback: any

  stopCamera(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
  stopScreenshare(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
  startAudio(): boolean {
    throw new Error("Method not implemented.")
  }
  stopAudio(): boolean {
    throw new Error("Method not implemented.")
  }
  muteUser(userId: number) {
    throw new Error("Method not implemented.")
  }
  unmuteUser(userId: number) {
    throw new Error("Method not implemented.")
  }
  deinitialize(): boolean {
    throw new Error("Method not implemented.")
  }
  getAllMessages(): Message[] {
    return []
  }
  addMessageToQueue(message: Message): boolean {
    throw new Error("Method not implemented.")
  }
  sendAllMessages() {
    throw new Error("Method not implemented.")
  }

  public async initialize(
    initializationCallback: any,
    setLocalConnectionIdCallback: any,
    onConnectedCallback: any,
    clientAddedCallback: any,
    clientRemovedCallback: any,
    getClosestPeersCallback: any,
    getLocalConnectionIdCallback: any
  ): Promise<void> {
    this.mediasoupDevice = new Device()

    this.initializationCallback = initializationCallback
    this.setLocalConnectionIdCallback = setLocalConnectionIdCallback
    this.onConnectedCallback = onConnectedCallback
    this.clientAddedCallback = clientAddedCallback
    this.clientRemovedCallback = clientRemovedCallback
    this.getClosestPeersCallback = getClosestPeersCallback
    this.getLocalConnectionIdCallback = getLocalConnectionIdCallback

    // use sendBeacon to tell the server we're disconnecting when
    // the page unloads
    window.addEventListener("unload", async () => {
      const result = await request("leave", {})
      console.log(result)
    })

    //@ts-ignore
    window.screenshare = this.startScreenshare

    alert("Access camera for full experience")
    await this.startCamera()

    function initSockets() {
      return new Promise(resolve => {
        const {
          location: { hostname }
        } = window
        console.log(`Initializing socket.io...,`)
        socket.on("connect", () => this.onConnectedCallback())

        request = promise(socket)

        socket.on("client-initialization", (_id: any, _ids: any) => {
          this.setLocalConnectionIdCallback(_id)
          if (_ids !== undefined) this.initializationCallback(_ids)
          resolve()
        })

        socket.on("newUserConnected", (clientCount: any, _id: any) => this.clientAddedCallback(_id))
        socket.on("userDisconnected", (_id: any) => this.clientRemovedCallback(_id))
      })
    }
    initSockets()

    // only join room after we user has interacted with DOM (to ensure that media elements play)
    if (!this.initialized) {
      this.initialized = true
      await this.sendCameraStreams()
      if (initializationCallback) initializationCallback()
    }

    setInterval(() => {
      socket.emit("heartbeat")
    }, 2000)

    console.log("Initialized!")
  }

  // TODO: HANDLE
  // remove <video> element and corresponding <canvas> using client ID
  removeClientDOMElements(_id: any) {
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
    if (this.joined) return
    this.joined = true

    console.log("Joining room")

    // signal that we're a new peer and initialize our
    // mediasoup-client device, if this is our first time connecting
    const resp = await request("join-as-new-peer")
    const { routerRtpCapabilities } = resp as any
    if (!this.mediasoupDevice.loaded) {
      await this.mediasoupDevice.load({ routerRtpCapabilities })
    }

    await this.pollAndUpdate() // start this polling loop
  }

  async sendCameraStreams(): Promise<void> {
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
        await this.camVideoProducer.pause()
      }

      // same thing for audio, but we can use our already-created
      this.camAudioProducer = await this.sendTransport.produce({
        track: this.localCam.getAudioTracks()[0],
        appData: { mediaTag: "cam-audio" }
      })

      if (webcamState.audioPaused) {
        this.camAudioProducer.pause()
      }
    }
    return
  }

  async startScreenshare(): Promise<boolean> {
    console.log("start screen share")

    // make sure we've joined the room and that we have a sending
    // transport
    await this.joinRoom()
    if (!this.sendTransport) {
      this.sendTransport = await this.createTransport("send")
    }

    // get a screen share track
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      await this.screenVideoProducer.pause()

      const { error } = (await request("close-producer", {
        producerId: this.screenVideoProducer.id
      })) as any
      await this.screenVideoProducer.close()
      this.screenVideoProducer = null
      if (error) {
        console.error(error)
      }
      if (this.screenAudioProducer) {
        const { error: screenAudioProducerError } = (await request("close-producer", {
          producerId: this.screenAudioProducer.id
        })) as any

        await this.screenAudioProducer.close()
        this.screenAudioProducer = null
        if (screenAudioProducerError) {
          console.error(screenAudioProducerError)
        }
      }
    }
    return true
  }

  async startCamera(): Promise<boolean> {
    if (this.localCam) {
      return false
    }
    console.log("start camera")
    try {
      this.localCam = await navigator.mediaDevices.getUserMedia(localMediaConstraints)
      webcamState.audioPaused = false
      webcamState.videoPaused = false
      return true
    } catch (e) {
      console.error("Start camera error", e)
      webcamState.audioPaused = true
      webcamState.videoPaused = true
      return false
    }
  }

  // switch to sending video from the "next" camera device in our device
  // list (if we have multiple cameras)
  async cycleCamera(): Promise<boolean> {
    if (!(this.camVideoProducer && this.camVideoProducer.track)) {
      console.log("cannot cycle camera - no current camera track")
      return false
    }

    console.log("cycle camera")

    // find "next" device in device list
    const deviceId = await this.getCurrentDeviceId()
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const vidDevices = allDevices.filter(d => d.kind === "videoinput")
    if (!(vidDevices.length > 1)) {
      console.log("cannot cycle camera - only one camera")
      return false
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
    return true
  }

  async stopSendingMediaStreams(): Promise<boolean> {
    if (!(this.localCam && this.localScreen)) {
      return false
    }
    if (!this.sendTransport) {
      return false
    }

    console.log("stop sending media streams")
    // $('#stop-streams').style.display = 'none';

    const { error } = (await request("close-transport", {
      transportId: this.sendTransport.id
    })) as any
    if (error) {
      console.error(error)
    }
    // closing the sendTransport closes all associated producers. when
    // the camVideoProducer and camAudioProducer are closed,
    // mediasoup-client stops the local cam tracks, so we don't need to
    // do anything except set all our local variables to null.
    await this.sendTransport.close()
    this.sendTransport = null
    this.camVideoProducer = null
    this.camAudioProducer = null
    this.screenVideoProducer = null
    this.screenAudioProducer = null
    this.localCam = null
    this.localScreen = null
    return true
  }

  async leaveRoom(): Promise<boolean> {
    if (!this.joined) {
      return false
    }

    console.log("leave room")

    // stop polling
    clearInterval(this.pollingInterval)

    // close everything on the server-side (transports, producers, consumers)
    const { error } = (await request("leave")) as any
    if (error) {
      console.error(error)
    }

    // closing the transports closes all producers and consumers. we
    // don't need to do anything beyond closing the transports, except
    // to set all our local variables to their initial states
    if (this.recvTransport) await this.recvTransport.close()
    if (this.sendTransport) await this.sendTransport.close()

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
    return true
  }

  async subscribeToTrack(peerId: string, mediaTag: string) {
    console.log("subscribe to track", peerId, mediaTag)

    // create a receive transport if we don't already have one
    if (!this.recvTransport) this.recvTransport = await this.createTransport("recv")

    // if we do already have a consumer, we shouldn't have called this
    // method
    let consumer = this.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag)

    if (consumer) return console.error("already have consumer for track", peerId, mediaTag)

    // ask the server to create a server-side consumer object and send
    // us back the info we need to create a client-side consumer

    const consumerParameters = await request("recv-track", {
      mediaTag,
      mediaPeerId: peerId,
      rtpCapabilities: this.mediasoupDevice.rtpCapabilities
    })
    consumer = await this.recvTransport.consume({
      ...consumerParameters,
      appData: { peerId, mediaTag }
    })

    // the server-side consumer will be started in paused state. wait
    // until we're connected, then send a resume request to the server
    // to get our first keyframe and start displaying video
    while (this.recvTransport.connectionState !== "connected") {
      await this.sleep(100)
    }
    // okay, we're ready. let's ask the peer to send us media
    await this.resumeConsumer(consumer)

    // keep track of all our consumers
    this.consumers.push(consumer)

    // ui
    await this.addVideoAudio(consumer, peerId)
  }

  async unsubscribeFromTrack(peerId: any, mediaTag: any) {
    const consumer = this.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag)
    if (!consumer) {
      return
    }

    console.log("unsubscribe from track", peerId, mediaTag)
    await this.closeConsumer(consumer)
  }

  async pauseConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; pause: () => any }) {
    if (consumer) {
      console.log("pause consumer", consumer.appData.peerId, consumer.appData.mediaTag)
      await request("pause-consumer", { consumerId: consumer.id })
      await consumer.pause()
    }
  }

  async resumeConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; resume: () => any }) {
    if (consumer) {
      console.log("resume consumer", consumer.appData.peerId, consumer.appData.mediaTag)
      await request("resume-consumer", { consumerId: consumer.id })
      await consumer.resume()
    }
  }

  async pauseProducer(producer: { appData: { mediaTag: any }; id: any; pause: () => any }) {
    if (producer) {
      console.log("pause producer", producer.appData.mediaTag)
      await request("pause-producer", { producerId: producer.id })
      await producer.pause()
    }
  }

  async resumeProducer(producer: { appData: { mediaTag: any }; id: any; resume: () => any }) {
    if (producer) {
      console.log("resume producer", producer.appData.mediaTag)
      await request("resume-producer", { producerId: producer.id })
      await producer.resume()
    }
  }

  async closeConsumer(consumer: any) {
    if (!consumer) {
      return
    }
    console.log("closing consumer", consumer.appData.peerId, consumer.appData.mediaTag)
    // tell the server we're closing this consumer. (the server-side
    // consumer may have been closed already, but that's okay.)
    await request("close-consumer", { consumerId: consumer.id })
    await consumer.close()

    this.consumers = this.consumers.filter(c => c !== consumer)
    this.removeVideoAudio(consumer)
  }

  // utility function to create a transport and hook up signaling logic
  // appropriate to the transport's direction
  //
  async createTransport(direction: string) {
    console.log(`create ${direction} transport`)

    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport
    const { transportOptions } = await request("create-transport", {
      direction
    })
    console.log("transport options", transportOptions)

    if (direction === "recv") {
      transport = await this.mediasoupDevice.createRecvTransport(transportOptions)
    } else if (direction === "send") {
      console.log("transport options:")
      console.log(transportOptions)
      transport = await this.mediasoupDevice.createSendTransport(transportOptions)
    } else {
      throw new Error(`bad transport 'direction': ${direction}`)
    }

    // mediasoup-client will emit a connect event when media needs to
    // start flowing for the first time. send dtlsParameters to the
    // server, then call callback() on success or errback() on failure.
    transport.on("connect", async ({ dtlsParameters }: any, callback: () => void, errback: () => void) => {
      console.log("transport connect event", direction)

      const { error } = (await request("connect-transport", {
        transportId: transportOptions.id,
        dtlsParameters
      })) as any
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
      transport.on("produce", async ({ kind, rtpParameters, appData }: any, callback: (arg0: { id: any }) => void, errback: () => void) => {
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

        const { error, id } = (await request("send-track", {
          transportId: transportOptions.id,
          kind,
          rtpParameters,
          paused,
          appData
        })) as any
        if (error) {
          console.error("error setting up server-side producer", error)
          errback()
          return
        }
        callback({ id })
      })
    }

    // any time a transport transitions to closed,
    // failed, or disconnected, leave the room and reset
    //
    transport.on("connectionstatechange", async (state: string) => {
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
    setTimeout(this.pollAndUpdate, 1000)

    const { peers, error } = (await request("sync")) as any

    if (error) {
      console.error("PollAndUpdateError: ", error)
    }

    if (this.getLocalConnectionIdCallback === undefined) return

    const localConnectionId = this.getLocalConnectionIdCallback()

    if (!(localConnectionId in peers)) {
      console.log("Server doesn't think you're connected!")
    }
    // decide if we need to update tracks list and video/audio
    // elements. build list of peers, sorted by join time, removing last
    // seen time and stats, so we can easily do a deep-equals
    // comparison. compare this list with the cached list from last
    // poll.

    // auto-subscribe to their feeds:
    const closestPeers = this.getClosestPeersCallback()
    for (const id in peers) {
      // for each peer...
      if (id !== localConnectionId) {
        // if it isnt me...
        if (closestPeers !== undefined && closestPeers.includes(id)) {
          // and if it is close enough in the 3d space...
          for (const [mediaTag, _] of Object.entries(peers[id].media)) {
            // for each of the peer's producers...
            console.log(id + " | " + mediaTag)
            if (this.consumers?.find(c => c.appData.peerId === id && c.appData.mediaTag === mediaTag) !== null) return
            // that we don't already have consumers for...
            console.log(`auto subscribing to track that ${id} has added`)
            await this.subscribeToTrack(id, mediaTag)
          }
        }
      }
    }

    // if a peer has gone away, we need to close all consumers we have
    // for that peer and remove video and audio elements
    for (const id in this.lastPollSyncData) {
      if (!peers[id]) {
        console.log(`Peer ${id} has exited`)
        if (this.consumers.length === 0) return console.log("Consumers length is 0")
        this.consumers.forEach(consumer => {
          if (consumer.appData.peerId === id) {
            this.closeConsumer(consumer)
          }
        })
      }
    }

    // if a peer has stopped sending media that we are consuming, we
    // need to close the consumer and remove video and audio elements
    if (this.consumers == undefined || this.consumers.length === 0) return console.log("Consumers length is 0")

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

  addVideoAudio(consumer: { track: { clone: () => MediaStreamTrack }; kind: string }, peerId: any) {
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
        // el.muted = true // necessary for
        // @ts-ignore
        // el.style = "visibility: hidden;"
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
      el.play().catch((e: any) => {
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
      // this.worldScene.createOrUpdatePositionalAudio(peerId)

      // let's "yield" and return before playing, rather than awaiting on
      // play() succeeding. play() will not succeed on a producer-paused
      // track until the producer unpauses.
      // @ts-ignore
      el.play().catch((e: any) => {
        console.log(`Play audio error: ${e}`)
        console.error(e)
      })
    }
  }

  removeVideoAudio(consumer: any) {
    // TODO: This was kind, now it's id, is that ok?
    document.querySelectorAll(consumer.id).forEach(v => {
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

  async sleep(ms: number) {
    return new Promise(r => setTimeout(() => r(), ms))
  }
}
