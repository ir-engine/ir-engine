import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { localAudioConstraints, localVideoConstraints } from '../constants/VideoConstants'
import { Network } from '../classes/Network'
import { isClient } from '../../common/functions/isClient'
import { getNearbyUsers, NearbyUser } from '../functions/getNearbyUsers'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { Engine } from '../../ecs/classes/Engine'
import { ChannelType } from '@xrengine/common/src/interfaces/Channel'

/** System class for media streaming. */
export class MediaStreams {
  static EVENTS = {
    TRIGGER_UPDATE_CONSUMERS: 'NETWORK_TRANSPORT_EVENT_UPDATE_CONSUMERS',
    CLOSE_CONSUMER: 'NETWORK_TRANSPORT_EVENT_CLOSE_CONSUMER',
    UPDATE_NEARBY_LAYER_USERS: 'NETWORK_TRANSPORT_EVENT_UPDATE_NEARBY_LAYER_USERS'
  }
  public static instance = new MediaStreams()

  /** Whether the video is paused or not. */
  public videoPaused = false
  /** Whether the audio is paused or not. */
  public audioPaused = false
  /** Whether the face tracking is enabled or not. */
  public faceTracking = false
  /** Video stream for streaming data. */
  public videoStream: MediaStream = null!
  /** Video stream for streaming data. */
  public audioStream: MediaStream = null!
  /** Audio Gain to be applied on media stream. */
  public audioGainNode: GainNode = null!

  /** Local screen container. */
  public localScreen = null as any
  /** Producer using camera to get Video. */
  public camVideoProducer = null as any
  /** Producer using camera to get Audio. */
  public camAudioProducer = null as any
  /** Producer using screen to get Video. */
  public screenVideoProducer = null as any
  /** Producer using screen to get Audio. */
  public screenAudioProducer = null as any
  /** List of all producers nodes.. */
  public producers = [] as any[]
  /** List of all consumer nodes. */
  public consumers = [] as any[]
  /** Indication of whether the video while screen sharing is paused or not. */
  public screenShareVideoPaused = false
  /** Indication of whether the audio while screen sharing is paused or not. */
  public screenShareAudioPaused = false
  /** Whether the component is initialized or not. */
  public initialized = false
  /** Current channel type */
  public channelType: ChannelType = null!
  /** Current channel ID */
  public channelId: string = null!

  public nearbyLayerUsers = [] as NearbyUser[]

  /**
   * Set face tracking state.
   * @param state New face tracking state.
   * @returns Updated face tracking state.
   */
  public setFaceTracking(state: boolean): boolean {
    this.faceTracking = state
    return this.faceTracking
  }

  /**
   * Pause/Resume the video.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setVideoPaused(state: boolean): boolean {
    console.log('setVideoPaused')
    this.videoPaused = state
    return this.videoPaused
  }

  /**
   * Pause/Resume the audio.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setAudioPaused(state: boolean): boolean {
    this.audioPaused = state
    return this.audioPaused
  }

  /**
   * Pause/Resume the video while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setScreenShareVideoPaused(state: boolean): boolean {
    this.screenShareVideoPaused = state
    return this.screenShareVideoPaused
  }

  /**
   * Pause/Resume the audio while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setScreenShareAudioPaused(state: boolean): boolean {
    this.screenShareAudioPaused = state
    return this.screenShareAudioPaused
  }

  /**
   * Toggle Pause state of video.
   * @returns Updated Pause state.
   */
  public toggleVideoPaused(): boolean {
    console.log('toggleVideoPaused')
    console.log(this.videoPaused)
    this.videoPaused = !this.videoPaused
    return this.videoPaused
  }

  /**
   * Toggle Pause state of audio.
   * @returns Updated Pause state.
   */
  public toggleAudioPaused(): boolean {
    this.audioPaused = !this.audioPaused
    return this.audioPaused
  }

  /**
   * Toggle Pause state of video while screen sharing.
   * @returns Updated Pause state.
   */
  public toggleScreenShareVideoPaused(): boolean {
    this.screenShareVideoPaused = !this.screenShareVideoPaused
    return this.screenShareVideoPaused
  }

  /**
   * Toggle Pause state of audio while screen sharing.
   * @returns Updated Pause state.
   */
  public toggleScreenShareAudioPaused(): boolean {
    this.screenShareAudioPaused = !this.screenShareAudioPaused
    return this.screenShareAudioPaused
  }

  /**
   * Start the camera.
   * @returns Whether the camera is started or not. */
  async startCamera(): Promise<boolean> {
    console.log('start camera')
    if (this.videoStream) return false
    return await this.getVideoStream()
  }

  async startMic(): Promise<boolean> {
    console.log('start Mic')
    if (this.audioStream) return false
    return await this.getAudioStream()
  }

  /**
   * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
   * @returns Whether camera cycled or not.
   */
  async cycleCamera(): Promise<boolean> {
    if (!(this.camVideoProducer && this.camVideoProducer.track)) {
      console.log('cannot cycle camera - no current camera track')
      return false
    }
    console.log('cycle camera')

    // find "next" device in device list
    const deviceId = await this.getCurrentDeviceId('video')
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const vidDevices = allDevices.filter((d) => d.kind === 'videoinput')
    if (!(vidDevices.length > 1)) {
      console.log('cannot cycle camera - only one camera')
      return false
    }
    let index = vidDevices.findIndex((d) => d.deviceId === deviceId)
    if (index === vidDevices.length - 1) index = 0
    else index += 1

    // get a new video stream. might as well get a new audio stream too,
    // just in case browsers want to group audio/video streams together
    // from the same device when possible (though they don't seem to,
    // currently)
    console.log('getting a video stream from new device', vidDevices[index].label)
    this.videoStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: vidDevices[index].deviceId } }
    })

    // replace the tracks we are sending
    await this.camVideoProducer.replaceTrack({
      track: this.videoStream.getVideoTracks()[0]
    })
    return true
  }

  /**
   * Get whether screen video paused or not.
   * @returns Screen video paused state.
   */
  getScreenPausedState(): boolean {
    return this.screenShareVideoPaused
  }

  /**
   * Get whether screen audio paused or not.
   * @returns Screen audio paused state.
   */
  getScreenAudioPausedState(): boolean {
    return this.screenShareAudioPaused
  }

  /**
   * Remove video and audio node from the consumer.
   * @param consumer Consumer from which video and audio node will be removed.
   */
  static removeVideoAudio(consumer: any): void {
    document.querySelectorAll(consumer.id).forEach((v) => {
      if (v.consumer === consumer) v?.parentNode.removeChild(v)
    })
  }

  /** Get device ID of device which is currently streaming media. */
  async getCurrentDeviceId(streamType: string) {
    if (streamType === 'video') {
      if (!this.camVideoProducer) return null

      const { deviceId } = this.camVideoProducer.track.getSettings()
      if (deviceId) return deviceId
      // Firefox doesn't have deviceId in MediaTrackSettings object
      const track = this.videoStream && this.videoStream.getVideoTracks()[0]
      if (!track) return null
      const devices = await navigator.mediaDevices.enumerateDevices()
      const deviceInfo = devices.find((d) => d.label.startsWith(track.label))!
      return deviceInfo.deviceId
    }
    if (streamType === 'audio') {
      if (!this.camAudioProducer) return null

      const { deviceId } = this.camAudioProducer.track.getSettings()
      if (deviceId) return deviceId
      // Firefox doesn't have deviceId in MediaTrackSettings object
      const track = this.audioStream && this.audioStream.getAudioTracks()[0]
      if (!track) return null
      const devices = await navigator.mediaDevices.enumerateDevices()
      const deviceInfo = devices.find((d) => d.label.startsWith(track.label))!
      return deviceInfo.deviceId
    }
  }

  /**
   * Get user video stream.
   * @returns Whether stream is active or not.
   */
  public async getVideoStream(): Promise<boolean> {
    try {
      console.log('Getting video stream')
      console.log(localVideoConstraints)
      this.videoStream = await navigator.mediaDevices.getUserMedia(localVideoConstraints)
      console.log(this.videoStream)
      if (this.videoStream.active) {
        this.videoPaused = false
        return true
      }
      this.videoPaused = true
      return false
    } catch (err) {
      console.log('failed to get video stream')
      console.log(err)
    }
    return false
  }

  /**
   * Get user video stream.
   * @returns Whether stream is active or not.
   */
  public async getAudioStream(): Promise<boolean> {
    try {
      console.log('Getting audio stream')
      console.log(localAudioConstraints)
      this.audioStream = await navigator.mediaDevices.getUserMedia(localAudioConstraints)
      console.log(this.audioStream)
      if (this.audioStream.active) {
        this.audioPaused = false
        return true
      }
      this.audioPaused = true
      return false
    } catch (err) {
      console.log('failed to get audio stream')
      console.log(err)
    }
    return false
  }
}

// every 5 seconds
const NEARYBY_AVATAR_UPDATE_PERIOD = 60 * 5

export default async function MediaStreamSystem(world: World): Promise<System> {
  let nearbyAvatarTick = 0
  let executeInProgress = false

  return () => {
    if (Network.instance.mediasoupOperationQueue.getBufferLength() > 0 && executeInProgress === false) {
      executeInProgress = true
      const buffer = Network.instance.mediasoupOperationQueue.pop() as any
      if (buffer.object && buffer.object.closed !== true && buffer.object._closed !== true) {
        try {
          if (buffer.action === 'resume') buffer.object.resume()
          else if (buffer.action === 'pause') buffer.object.pause()
          executeInProgress = false
        } catch (err) {
          executeInProgress = false
          console.log('Pause or resume error')
          console.log(err)
          console.log(buffer.object)
        }
      } else {
        executeInProgress = false
      }
    }

    if (isClient) {
      nearbyAvatarTick++
      if (nearbyAvatarTick > NEARYBY_AVATAR_UPDATE_PERIOD) {
        nearbyAvatarTick = 0
        if (MediaStreams.instance.channelType === 'instance') {
          MediaStreams.instance.nearbyLayerUsers = getNearbyUsers(Engine.userId)
          const nearbyUserIds = MediaStreams.instance.nearbyLayerUsers.map((user) => user.id)
          EngineEvents.instance.dispatchEvent({ type: MediaStreams.EVENTS.UPDATE_NEARBY_LAYER_USERS })
          MediaStreams.instance.consumers.forEach((consumer) => {
            if (!nearbyUserIds.includes(consumer._appData.peerId)) {
              EngineEvents.instance.dispatchEvent({ type: MediaStreams.EVENTS.CLOSE_CONSUMER, consumer })
            }
          })
        }
      }
    }
  }
}
