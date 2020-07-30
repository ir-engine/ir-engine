/* eslint-disable @typescript-eslint/ban-ts-comment */
import MediaStreamComponent from "../../components/MediaStreamComponent"
import io from "socket.io-client"
import { Device } from "mediasoup-client"
import { promise } from "../../../common/utils/promise"
import { CAM_VIDEO_SIMULCAST_ENCODINGS } from "../../constants/VideoConstants"
import { sleep } from "../../../common/utils/sleep"
import MessageTypes from "./MessageTypes"
import { NetworkSystem } from "../../systems/NetworkSystem"
import { MediaStreamControlSystem } from "../../systems/MediaStreamSystem"
import NetworkTransport from "../../interfaces/NetworkTransport"
import MessageQueue from "../../components/MessageQueue"
import Message from "../../interfaces/Message"

export default class SocketWebRTCClientTransport implements NetworkTransport {
  supportsMediaStreams = true
  mediasoupDevice: Device
  joined: boolean
  recvTransport
  sendTransport
  lastPollSyncData = {}
  pollingInterval: NodeJS.Timeout
  heartbeatInterval = 2000
  pollingTickRate = 1000

  socket: SocketIOClient.Socket

  request

  sendAllReliableMessages(): void {
    while (!MessageQueue.instance.outgoingReliableQueue.empty) {
      this.socket.emit(MessageTypes.ReliableMessage as any, MessageQueue.instance.outgoingReliableQueue.pop)
    }
  }

  public async initialize(address = "https://localhost", port = 3001): Promise<void> {
    this.mediasoupDevice = new Device()

    this.socket = io(`${address}:${port}`)
    this.request = promise(this.socket)

    // use sendBeacon to tell the server we're disconnecting when
    // the page unloads
    window.addEventListener("unload", async () => {
      const result = await this.request(MessageTypes.LeaveWorldRequest, {})
      console.log(result)
    })

    //@ts-ignore
    window.screenshare = await this.startScreenshare

    // only join  after we user has interacted with DOM (to ensure that media elements play)
    if (MediaStreamComponent.instance.initialized) return
    MediaStreamComponent.instance.initialized = true
    await this.sendCameraStreams()

    function initSockets() {
      return new Promise(resolve => {
        const {
          location: { hostname }
        } = window
        console.log(`Initializing socket.io...,`)
        this.socket.on(MessageTypes.ConnectionRequest as any, () => this.onConnectedCallback())

        this.socket.on(MessageTypes.InitializationRequest as any, (_id: any, _ids: any) => {
          if (_ids !== undefined) NetworkSystem.instance.initializeClient(_id, _ids)
          resolve()
        })

        this.socket.on(MessageTypes.ClientConnected as any, (clientCount: any, _id: any) => NetworkSystem.instance.addClient(_id))
        this.socket.on(MessageTypes.ClientDisconnected as any, (_id: any) => NetworkSystem.instance.removeClient(_id))

        this.socket.on(MessageTypes.ReliableMessage as any, (message: Message) => {
          MessageQueue.instance.incomingReliableQueue.add(message)
        })
      })
    }
    initSockets()

    setInterval(() => {
      this.socket.emit(MessageTypes.Heartbeat as any)
    }, this.heartbeatInterval)

    console.log("Initialized!")
  }

  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
  // Mediasoup Code:
  //= =//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

  // meeting control actions
  async joinWorld() {
    if (this.joined) return
    this.joined = true

    console.log("Joining world")

    // signal that we're a new peer and initialize our
    // mediasoup-client device, if this is our first time connecting
    const resp = await this.request(MessageTypes.JoinWorldRequest)
    const { routerRtpCapabilities } = resp as any
    if (!this.mediasoupDevice.loaded) await this.mediasoupDevice.load({ routerRtpCapabilities })
    await this.pollAndUpdate() // start this polling loop
  }

  async sendCameraStreams(): Promise<void> {
    console.log("send camera streams")

    // make sure we've joined the  and started our camera. these
    // functions don't do anything if they've already been called this
    // session
    await this.joinWorld()

    // create a transport for outgoing media, if we don't already have one
    if (!this.sendTransport) this.sendTransport = await this.createTransport("send")
    if (!MediaStreamComponent.instance.mediaStream) return

    // start sending video. the transport logic will initiate a
    // signaling conversation with the server to set up an outbound rtp
    // stream for the camera video track. our createTransport() function
    // includes logic to tell the server to start the stream in a paused
    // state, if the checkbox in our UI is unchecked. so as soon as we
    // have a client-side camVideoProducer object, we need to set it to
    // paused as appropriate, too.
    MediaStreamComponent.instance.camVideoProducer = await this.sendTransport.produce({
      track: MediaStreamComponent.instance.mediaStream.getVideoTracks()[0],
      encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
      appData: { mediaTag: "cam-video" }
    })

    if (MediaStreamComponent.instance.videoPaused) await MediaStreamComponent.instance.camVideoProducer.pause()

    // same thing for audio, but we can use our already-created
    MediaStreamComponent.instance.camAudioProducer = await this.sendTransport.produce({
      track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
      appData: { mediaTag: "cam-audio" }
    })

    if (MediaStreamComponent.instance.audioPaused) MediaStreamComponent.instance.camAudioProducer.pause()
  }

  async startScreenshare(): Promise<boolean> {
    console.log("start screen share")

    // make sure we've joined the  and that we have a sending
    // transport
    await this.joinWorld()
    if (!this.sendTransport) this.sendTransport = await this.createTransport("send")

    // get a screen share track
    // @ts-ignore
    this.localScreen = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })

    // create a producer for video
    MediaStreamComponent.instance.screenVideoProducer = await this.sendTransport.produce({
      track: MediaStreamComponent.instance.localScreen.getVideoTracks()[0],
      encodings: {}, // TODO: Add me
      appData: { mediaTag: "screen-video" }
    })

    // create a producer for audio, if we have it
    if (MediaStreamComponent.instance.localScreen.getAudioTracks().length) {
      MediaStreamComponent.instance.screenAudioProducer = await this.sendTransport.produce({
        track: MediaStreamComponent.instance.localScreen.getAudioTracks()[0],
        appData: { mediaTag: "screen-audio" }
      })
    }

    // handler for screen share stopped event (triggered by the
    // browser's built-in screen sharing ui)
    MediaStreamComponent.instance.screenVideoProducer.track.onended = async () => {
      console.log("screen share stopped")
      await MediaStreamComponent.instance.screenVideoProducer.pause()

      const { error } = (await this.request(MessageTypes.WebRTCCloseProducerRequest, {
        producerId: MediaStreamComponent.instance.screenVideoProducer.id
      })) as any
      await MediaStreamComponent.instance.screenVideoProducer.close()
      MediaStreamComponent.instance.screenVideoProducer = null
      if (error) {
        console.error(error)
      }
      if (MediaStreamComponent.instance.screenAudioProducer) {
        const { error: screenAudioProducerError } = (await this.request(MessageTypes.WebRTCCloseProducerRequest, {
          producerId: MediaStreamComponent.instance.screenAudioProducer.id
        })) as any

        await MediaStreamComponent.instance.screenAudioProducer.close()
        MediaStreamComponent.instance.screenAudioProducer = null
        if (screenAudioProducerError) {
          console.error(screenAudioProducerError)
        }
      }
    }
    return true
  }

  async stopSendingMediaStreams(): Promise<boolean> {
    if (!(MediaStreamComponent.instance.mediaStream && MediaStreamComponent.instance.localScreen)) return false
    if (!this.sendTransport) return false

    console.log("stop sending media streams")

    const { error } = (await this.request(MessageTypes.WebRTCTransportCloseRequest, {
      transportId: this.sendTransport.id
    })) as any
    if (error) console.error(error)
    // closing the sendTransport closes all associated producers. when
    // the camVideoProducer and camAudioProducer are closed,
    // mediasoup-client stops the local cam tracks, so we don't need to
    // do anything except set all our local variables to null.
    await this.sendTransport.close()
    this.sendTransport = null
    MediaStreamComponent.instance.camVideoProducer = null
    MediaStreamComponent.instance.camAudioProducer = null
    MediaStreamComponent.instance.screenVideoProducer = null
    MediaStreamComponent.instance.screenAudioProducer = null
    MediaStreamComponent.instance.mediaStream = null
    MediaStreamComponent.instance.localScreen = null
    return true
  }

  async leave(): Promise<boolean> {
    if (!this.joined) return false
    console.log("leave ")

    // stop polling
    clearInterval(this.pollingInterval)

    // close everything on the server-side (transports, producers, consumers)
    const { error } = (await this.request(MessageTypes.LeaveWorldRequest)) as any
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
    MediaStreamComponent.instance.camVideoProducer = null
    MediaStreamComponent.instance.camAudioProducer = null
    MediaStreamComponent.instance.screenVideoProducer = null
    MediaStreamComponent.instance.screenAudioProducer = null
    MediaStreamComponent.instance.mediaStream = null
    MediaStreamComponent.instance.localScreen = null
    this.lastPollSyncData = {}
    MediaStreamComponent.instance.consumers = []
    this.joined = false
    return true
  }

  async subscribeToTrack(peerId: string, mediaTag: string) {
    console.log("subscribe to track", peerId, mediaTag)

    // create a receive transport if we don't already have one
    if (!this.recvTransport) this.recvTransport = await this.createTransport("recv")

    // if we do already have a consumer, we shouldn't have called this
    // method
    let consumer = MediaStreamComponent.instance.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag)
    if (consumer) return console.error("already have consumer for track", peerId, mediaTag)

    // ask the server to create a server-side consumer object and send
    // us back the info we need to create a client-side consumer

    const consumerParameters = (await this.request(MessageTypes.WebRTCReceiveTrackRequest, {
      mediaTag,
      mediaPeerId: peerId,
      rtpCapabilities: this.mediasoupDevice.rtpCapabilities
    })) as any
    consumer = await this.recvTransport.consume({
      ...consumerParameters,
      appData: { peerId, mediaTag }
    })

    // the server-side consumer will be started in paused state. wait
    // until we're connected, then send a resume request to the server
    // to get our first keyframe and start displaying video
    while (this.recvTransport.connectionState !== "connected") await sleep(100)

    // okay, we're ready. let's ask the peer to send us media
    await this.resumeConsumer(consumer)

    // keep track of all our consumers
    MediaStreamComponent.instance.consumers.push(consumer)

    // ui
    await MediaStreamControlSystem.instance.addVideoAudio(consumer, peerId)
  }

  async unsubscribeFromTrack(peerId: any, mediaTag: any) {
    console.log("unsubscribe from track", peerId, mediaTag)
    const consumer = MediaStreamComponent.instance.consumers.find(c => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag)
    if (!consumer) return
    await this.closeConsumer(consumer)
  }

  async pauseConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; pause: () => any }) {
    if (!consumer) return
    console.log("pause consumer", consumer.appData.peerId, consumer.appData.mediaTag)
    await this.request(MessageTypes.WebRTCPauseConsumerRequest, { consumerId: consumer.id })
    await consumer.pause()
  }

  async resumeConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; resume: () => any }) {
    if (!consumer) return
    console.log("resume consumer", consumer.appData.peerId, consumer.appData.mediaTag)
    await this.request(MessageTypes.WebRTCResumeConsumerRequest, { consumerId: consumer.id })
    await consumer.resume()
  }

  async pauseProducer(producer: { appData: { mediaTag: any }; id: any; pause: () => any }) {
    if (!producer) return
    console.log("pause producer", producer.appData.mediaTag)
    await this.request(MessageTypes.WebRTCPauseProducerRequest, { producerId: producer.id })
    await producer.pause()
  }

  async resumeProducer(producer: { appData: { mediaTag: any }; id: any; resume: () => any }) {
    if (!producer) return
    console.log("resume producer", producer.appData.mediaTag)
    await this.request(MessageTypes.WebRTCResumeProducerRequest, { producerId: producer.id })
    await producer.resume()
  }

  async closeConsumer(consumer: any) {
    if (!consumer) return
    console.log("closing consumer", consumer.appData.peerId, consumer.appData.mediaTag)
    // tell the server we're closing this consumer. (the server-side
    // consumer may have been closed already, but that's okay.)
    await this.request(MessageTypes.WebRTCTransportCloseRequest, { consumerId: consumer.id })
    await consumer.close()

    MediaStreamComponent.instance.consumers = MediaStreamComponent.instance.consumers.filter(c => c !== consumer)
    MediaStreamControlSystem.instance.removeVideoAudio(consumer)
  }

  // utility function to create a transport and hook up signaling logic
  // appropriate to the transport's direction
  async createTransport(direction: string) {
    console.log(`create ${direction} transport`)

    // ask the server to create a server-side transport object and send
    // us back the info we need to create a client-side transport
    let transport
    const { transportOptions } = (await this.request(MessageTypes.WebRTCTransportCreateRequest, { direction })) as any
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
      const { error } = (await this.request(MessageTypes.WebRTCTransportConnectRequest, { transportId: transportOptions.id, dtlsParameters })) as any
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
        if (appData.mediaTag === "cam-video") paused = MediaStreamComponent.instance.videoPaused
        else if (appData.mediaTag === "cam-audio") paused = MediaStreamComponent.instance.audioPaused

        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.
        const { error, id } = (await this.request(MessageTypes.WebRTCSendTrackRequest, {
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
    // failed, or disconnected, leave the  and reset
    transport.on("connectionstatechange", async (state: string) => {
      console.log(`transport ${transport.id} connectionstatechange ${state}`)
      // for this simple sample code, assume that transports being
      // closed is an error (we never close these transports except when
      // we leave the )
      if (state === "closed" || state === "failed" || state === "disconnected") {
        console.log("transport closed ... leaving the  and resetting")
        alert("Your connection failed.  Please restart the page")
      }
    })

    return transport
  }

  // polling/update logic
  async pollAndUpdate() {
    console.log("Polling server for current peers array!")
    setTimeout(this.pollAndUpdate, this.pollingTickRate)

    const { peers, error } = (await this.request(MessageTypes.SynchronizationRequest)) as any

    if (error) console.error("PollAndUpdateError: ", error)

    const localConnectionId = NetworkSystem.instance.getLocalConnectionId()
    if (!(localConnectionId in peers)) console.log("Server doesn't think you're connected!")

    // decide if we need to update tracks list and video/audio
    // elements. build list of peers, sorted by join time, removing last
    // seen time and stats, so we can easily do a deep-equals
    // comparison. compare this list with the cached list from last
    // poll.

    // auto-subscribe to their feeds:
    const closestPeers = NetworkSystem.instance.getClosestPeers()
    for (const id in peers) {
      // for each peer...
      if (id !== localConnectionId) {
        // if it isnt me...
        if (closestPeers !== undefined && closestPeers.includes(id)) {
          // and if it is close enough in the 3d space...
          for (const [mediaTag, _] of Object.entries(peers[id].media)) {
            // for each of the peer's producers...
            console.log(id + " | " + mediaTag)
            if (MediaStreamComponent.instance.consumers?.find(c => c.appData.peerId === id && c.appData.mediaTag === mediaTag) !== null) return
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
        if (MediaStreamComponent.instance.consumers.length === 0) return console.log("Consumers length is 0")
        MediaStreamComponent.instance.consumers.forEach(consumer => {
          if (consumer.appData.peerId === id) {
            this.closeConsumer(consumer)
          }
        })
      }
    }

    // if a peer has stopped sending media that we are consuming, we
    // need to close the consumer and remove video and audio elements
    if (MediaStreamComponent.instance.consumers == undefined || MediaStreamComponent.instance.consumers.length === 0)
      return console.log("Consumers length is 0")

    MediaStreamComponent.instance.consumers.forEach(consumer => {
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
}
