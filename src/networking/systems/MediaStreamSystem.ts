/* eslint-disable @typescript-eslint/ban-ts-comment */
import { System, World } from "ecsy"
import MediaStreamComponent from "../components/MediaStreamComponent"
import { localMediaConstraints } from "../constants/VideoConstants"
import NetworkTransportComponent from "../components/NetworkTransportComponent"

export class MediaStreamControlSystem extends System {
  public static instance: MediaStreamControlSystem
  mediaStreamComponent: MediaStreamComponent
  constructor(world: World) {
    super(world)
    MediaStreamControlSystem.instance = this
    this.mediaStreamComponent = world
      .registerComponent(MediaStreamComponent)
      .createEntity()
      .addComponent(MediaStreamComponent)
      .getComponent(MediaStreamComponent)

    this.startCamera()
  }

  public execute() {
    // eh
  }

  async startCamera(): Promise<boolean> {
    if (this.mediaStreamComponent.mediaStream) return false
    console.log("start camera")
    return this.getMediaStream()
  }

  // switch to sending video from the "next" camera device in our device
  // list (if we have multiple cameras)
  async cycleCamera(): Promise<boolean> {
    if (!(this.mediaStreamComponent.camVideoProducer && this.mediaStreamComponent.camVideoProducer.track)) {
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
    if (idx === vidDevices.length - 1) idx = 0
    else idx += 1

    // get a new video stream. might as well get a new audio stream too,
    // just in case browsers want to group audio/video streams together
    // from the same device when possible (though they don't seem to,
    // currently)
    console.log("getting a video stream from new device", vidDevices[idx].label)
    this.mediaStreamComponent.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: vidDevices[idx].deviceId } },
      audio: true
    })

    // replace the tracks we are sending
    await this.mediaStreamComponent.camVideoProducer.replaceTrack({ track: this.mediaStreamComponent.mediaStream.getVideoTracks()[0] })
    await this.mediaStreamComponent.camAudioProducer.replaceTrack({ track: this.mediaStreamComponent.mediaStream.getAudioTracks()[0] })
    return true
  }

  // -- user interface --
  getScreenPausedState() {
    return MediaStreamComponent.instance.screenShareVideoPaused
  }

  getScreenAudioPausedState() {
    return MediaStreamComponent.instance.screenShareAudioPaused
  }

  async toggleWebcamVideoPauseState() {
    const videoPaused = MediaStreamComponent.instance.toggleVideoPaused()
    if (videoPaused) (NetworkTransportComponent.instance.transport as any).pauseProducer(MediaStreamComponent.instance.camVideoProducer)
    else (NetworkTransportComponent.instance.transport as any).resumeProducer(MediaStreamComponent.instance.camVideoProducer)
  }

  async toggleWebcamAudioPauseState() {
    const audioPaused = MediaStreamComponent.instance.toggleAudioPaused()
    if (audioPaused) (NetworkTransportComponent.instance.transport as any).resumeProducer(MediaStreamComponent.instance.camAudioProducer)
    else (NetworkTransportComponent.instance.transport as any).pauseProducer(MediaStreamComponent.instance.camAudioProducer)
  }

  async toggleScreenshareVideoPauseState() {
    if (this.getScreenPausedState())
      (NetworkTransportComponent.instance.transport as any).pauseProducer(MediaStreamComponent.instance.screenVideoProducer)
    else (NetworkTransportComponent.instance.transport as any).resumeProducer(MediaStreamComponent.instance.screenVideoProducer)
    MediaStreamComponent.instance.screenShareVideoPaused = !MediaStreamComponent.instance.screenShareVideoPaused
  }

  async toggleScreenshareAudioPauseState() {
    if (this.getScreenAudioPausedState())
      (NetworkTransportComponent.instance.transport as any).pauseProducer(MediaStreamComponent.instance.screenAudioProducer)
    else (NetworkTransportComponent.instance.transport as any).resumeProducer(MediaStreamComponent.instance.screenAudioProducer)
    MediaStreamComponent.instance.screenShareAudioPaused = !MediaStreamComponent.instance.screenShareAudioPaused
  }

  removeVideoAudio(consumer: any) {
    document.querySelectorAll(consumer.id).forEach(v => {
      if (v.consumer === consumer) v.parentNode.removeChild(v)
    })
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
      console.log("Creating video element with ID " + elementID)
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

  async getCurrentDeviceId() {
    if (!MediaStreamComponent.instance.camVideoProducer) return null

    const { deviceId } = MediaStreamComponent.instance.camVideoProducer.track.getSettings()
    if (deviceId) return deviceId
    // Firefox doesn't have deviceId in MediaTrackSettings object
    const track = MediaStreamComponent.instance.mediaStream && MediaStreamComponent.instance.mediaStream.getVideoTracks()[0]
    if (!track) return null
    const devices = await navigator.mediaDevices.enumerateDevices()
    const deviceInfo = devices.find(d => d.label.startsWith(track.label))
    return deviceInfo.deviceId
  }

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

  public async getMediaStream(): Promise<boolean> {
    this.mediaStreamComponent.mediaStream = await navigator.mediaDevices.getUserMedia(localMediaConstraints)
    if (this.mediaStreamComponent.mediaStream.active) {
      this.mediaStreamComponent.audioPaused = false
      this.mediaStreamComponent.videoPaused = false
      return true
    }
    this.mediaStreamComponent.audioPaused = true
    this.mediaStreamComponent.videoPaused = true
    return false
  }
}
