import multiLogger from '@xrengine/common/src/logger'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { localAudioConstraints, localVideoConstraints } from '@xrengine/engine/src/networking/constants/VideoConstants'
import { defineAction } from '@xrengine/hyperflux'

const logger = multiLogger.child({ component: 'client-core:MediaStreams' })

/** System class for media streaming. */
export class MediaStreams {
  static actions = {
    triggerUpdateConsumers: defineAction({
      type: 'xre.client.MediaStreams.NETWORK_TRANSPORT_EVENT_UPDATE_CONSUMERS' as const
    }),
    closeConsumer: defineAction({
      type: 'xre.client.MediaStreams.NETWORK_TRANSPORT_EVENT_CLOSE_CONSUMER' as const,
      consumer: matches.any
    })
  }
  static instance = new MediaStreams()

  /** Whether the video is paused or not. */
  videoPaused = false
  /** Whether the audio is paused or not. */
  audioPaused = false
  /** Whether the face tracking is enabled or not. */
  faceTracking = false
  /** Video stream for streaming data. */
  videoStream: MediaStream = null!
  /** Audio stream for streaming data. */
  audioStream: MediaStream = null!
  /** Audio Gain to be applied on media stream. */
  microphoneGainNode: GainNode = null!

  /** Local screen container. */
  localScreen = null! as MediaStream
  /** Producer using camera to get Video. */
  camVideoProducer = null as any
  /** Producer using camera to get Audio. */
  camAudioProducer = null as any
  /** Producer using screen to get Video. */
  screenVideoProducer = null as any
  /** Producer using screen to get Audio. */
  screenAudioProducer = null as any
  /** Indication of whether the video while screen sharing is paused or not. */
  screenShareVideoPaused = false
  /** Indication of whether the audio while screen sharing is paused or not. */
  screenShareAudioPaused = false

  /**
   * Set face tracking state.
   * @param state New face tracking state.
   * @returns Updated face tracking state.
   */
  setFaceTracking(state: boolean): boolean {
    this.faceTracking = state
    return this.faceTracking
  }

  /**
   * Pause/Resume the video.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  setVideoPaused(state: boolean): boolean {
    logger.info('setVideoPaused')
    this.videoPaused = state
    return this.videoPaused
  }

  /**
   * Pause/Resume the audio.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  setAudioPaused(state: boolean): boolean {
    this.audioPaused = state
    return this.audioPaused
  }

  /**
   * Pause/Resume the video while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  setScreenShareVideoPaused(state: boolean): boolean {
    this.screenShareVideoPaused = state
    return this.screenShareVideoPaused
  }

  /**
   * Pause/Resume the audio while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  setScreenShareAudioPaused(state: boolean): boolean {
    this.screenShareAudioPaused = state
    return this.screenShareAudioPaused
  }

  /**
   * Toggle Pause state of video.
   * @returns Updated Pause state.
   */
  toggleVideoPaused(): boolean {
    logger.info(`toggleVideoPaused: ${this.videoPaused}`)
    this.videoPaused = !this.videoPaused
    return this.videoPaused
  }

  /**
   * Toggle Pause state of audio.
   * @returns Updated Pause state.
   */
  toggleAudioPaused(): boolean {
    this.audioPaused = !this.audioPaused
    return this.audioPaused
  }

  /**
   * Toggle Pause state of video while screen sharing.
   * @returns Updated Pause state.
   */
  toggleScreenShareVideoPaused(): boolean {
    this.screenShareVideoPaused = !this.screenShareVideoPaused
    return this.screenShareVideoPaused
  }

  /**
   * Toggle Pause state of audio while screen sharing.
   * @returns Updated Pause state.
   */
  toggleScreenShareAudioPaused(): boolean {
    this.screenShareAudioPaused = !this.screenShareAudioPaused
    return this.screenShareAudioPaused
  }

  /**
   * Start the camera.
   * @returns Whether the camera is started or not. */
  async startCamera(): Promise<boolean> {
    logger.info('Start camera')
    if (this.videoStream?.active) return false
    return await this.getVideoStream()
  }

  async startMic(): Promise<boolean> {
    logger.info('Start Mic')
    if (this.audioStream?.active) return false
    return await this.getAudioStream()
  }

  /**
   * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
   * @returns Whether camera cycled or not.
   */
  async cycleCamera(): Promise<boolean> {
    if (!(this.camVideoProducer && this.camVideoProducer.track)) {
      logger.info('Cannot cycle camera - no current camera track')
      return false
    }
    logger.info('Cycle camera')

    // find "next" device in device list
    const deviceId = await this.getCurrentDeviceId('video')
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const vidDevices = allDevices.filter((d) => d.kind === 'videoinput')
    if (!(vidDevices.length > 1)) {
      logger.info('Cannot cycle camera - only one camera')
      return false
    }
    let index = vidDevices.findIndex((d) => d.deviceId === deviceId)
    if (index === vidDevices.length - 1) index = 0
    else index += 1

    // get a new video stream. might as well get a new audio stream too,
    // just in case browsers want to group audio/video streams together
    // from the same device when possible (though they don't seem to,
    // currently)
    logger.info(`Getting a video stream from new device "${vidDevices[index].label}".`)
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
  async getVideoStream(): Promise<boolean> {
    try {
      logger.info('Getting video stream %o', localVideoConstraints)
      this.videoStream = await navigator.mediaDevices.getUserMedia(localVideoConstraints)
      if (this.camVideoProducer && !this.camVideoProducer.closed) {
        await this.camVideoProducer.replaceTrack({
          track: this.videoStream.getVideoTracks()[0]
        })
      }
      if (this.videoStream.active) {
        this.videoPaused = this.camVideoProducer != null
        return true
      }
      this.videoPaused = true
      return false
    } catch (err) {
      logger.error(err, 'Failed to get video stream')
    }
    return false
  }

  /**
   * Get user video stream.
   * @returns Whether stream is active or not.
   */
  async getAudioStream(): Promise<boolean> {
    try {
      logger.info('Getting audio stream %o', localAudioConstraints)
      this.audioStream = await navigator.mediaDevices.getUserMedia(localAudioConstraints)
      if (this.camAudioProducer && !this.camAudioProducer.closed)
        await this.camAudioProducer.replaceTrack({
          track: this.audioStream.getAudioTracks()[0]
        })
      if (this.audioStream.active) {
        this.audioPaused = this.camAudioProducer != null
        return true
      }
      this.audioPaused = true
      return false
    } catch (err) {
      logger.error(err, 'Failed to get audio stream')
    }
    return false
  }
}

globalThis.MediaStreams = MediaStreams
