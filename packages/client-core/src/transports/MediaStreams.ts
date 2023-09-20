/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import {
  localAudioConstraints,
  localVideoConstraints
} from '@etherealengine/engine/src/networking/constants/VideoConstants'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { ProducerExtension } from './SocketWebRTCClientFunctions'

const logger = multiLogger.child({ component: 'client-core:MediaStreams' })

export const MediaStreamState = defineState({
  name: 'MediaStreamState',
  initial: {
    /** Whether the video is paused or not. */
    videoPaused: false,
    /** Whether the audio is paused or not. */
    audioPaused: false,
    /** Whether the face tracking is enabled or not. */
    faceTracking: false,
    /** Video stream for streaming data. */
    videoStream: null as MediaStream | null,
    /** Audio stream for streaming data. */
    audioStream: null as MediaStream | null,
    /** Audio Gain to be applied on media stream. */
    microphoneGainNode: null as GainNode | null,
    /** Local screen container. */
    localScreen: null as MediaStream | null,
    /** Producer using camera to get Video. */
    camVideoProducer: null as ProducerExtension | null,
    /** Producer using camera to get Audio. */
    camAudioProducer: null as ProducerExtension | null,
    /** Producer using screen to get Video. */
    screenVideoProducer: null as ProducerExtension | null,
    /** Producer using screen to get Audio. */
    screenAudioProducer: null as ProducerExtension | null,
    /** Indication of whether the video while screen sharing is paused or not. */
    screenShareVideoPaused: false,
    /** Indication of whether the audio while screen sharing is paused or not. */
    screenShareAudioPaused: false
  }
})

export const MediaStreamService = {
  /**
   * Start the camera.
   * @returns Whether the camera is started or not. */
  async startCamera() {
    logger.info('Start camera')
    if (getMutableState(MediaStreamState).videoStream.value?.active) return false
    return await MediaStreamService.getVideoStream()
  },

  async startMic() {
    logger.info('Start Mic')
    if (getMutableState(MediaStreamState).audioStream.value?.active) return false
    return await MediaStreamService.getAudioStream()
  },

  /**
   * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
   * @returns Whether camera cycled or not.
   */
  async cycleCamera() {
    const state = getMutableState(MediaStreamState)
    if (!state.camVideoProducer.value?.track) {
      logger.info('Cannot cycle camera - no current camera track')
      return false
    }
    logger.info('Cycle camera')

    // find "next" device in device list
    const deviceId = await MediaStreamService.getCurrentDeviceId('video')
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const vidDevices = allDevices.filter((d) => d.kind === 'videoinput')
    if (!(vidDevices.length > 1)) {
      logger.info('Cannot cycle camera - only one camera')
      return false
    }

    let tries = 0
    let index = vidDevices.findIndex((d) => d.deviceId === deviceId)

    const cycle = async () => {
      if (index === vidDevices.length - 1) index = 0
      else index += 1

      // get a new video stream. might as well get a new audio stream too,
      // just in case browsers want to group audio/video streams together
      // from the same device when possible (though they don't seem to,
      // currently)
      logger.info(`Getting a video stream from new device "${vidDevices[index].label}".`)

      try {
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: vidDevices[index].deviceId } }
        })
        state.videoStream.set(newVideoStream)

        if (!state.camVideoProducer.value) return

        // replace the tracks we are sending
        await state.camVideoProducer.value!.replaceTrack({
          track: newVideoStream.getVideoTracks()[0]
        })
      } catch (e) {
        console.error(e)
        tries++
        if (tries >= vidDevices.length - 1) throw new Error('Could not get video stream')
        cycle()
      }
    }

    cycle()
  },

  /**
   * Remove video and audio node from the consumer.
   * @param consumer Consumer from which video and audio node will be removed.
   */
  removeVideoAudio(consumer: any): void {
    document.querySelectorAll(consumer.id).forEach((v) => {
      if (v.consumer === consumer) v?.parentNode.removeChild(v)
    })
  },

  /** Get device ID of device which is currently streaming media. */
  async getCurrentDeviceId(streamType: string) {
    const state = getMutableState(MediaStreamState)
    if (streamType === 'video') {
      if (!state.camVideoProducer.value) return null

      const { deviceId } = state.camVideoProducer.value.track!.getSettings()
      if (deviceId) return deviceId
      // Firefox doesn't have deviceId in MediaTrackSettings object
      const track = state.videoStream.value!.getVideoTracks()[0]
      if (!track) return null
      const devices = await navigator.mediaDevices.enumerateDevices()
      const deviceInfo = devices.find((d) => d.label.startsWith(track.label))!
      return deviceInfo.deviceId
    }
    if (streamType === 'audio') {
      if (!state.camAudioProducer.value) return null

      const { deviceId } = state.camAudioProducer.value.track!.getSettings()
      if (deviceId) return deviceId
      // Firefox doesn't have deviceId in MediaTrackSettings object
      const track = state.audioStream.value!.getAudioTracks()[0]
      if (!track) return null
      const devices = await navigator.mediaDevices.enumerateDevices()
      const deviceInfo = devices.find((d) => d.label.startsWith(track.label))!
      return deviceInfo.deviceId
    }
  },

  /**
   * Get user video stream.
   * @returns Whether stream is active or not.
   */
  async getVideoStream() {
    const state = getMutableState(MediaStreamState)
    try {
      logger.info('Getting video stream %o', localVideoConstraints)
      const videoStream = await navigator.mediaDevices.getUserMedia(localVideoConstraints)
      state.videoStream.set(videoStream)
      if (state.camVideoProducer.value && !state.camVideoProducer.value.closed) {
        await state.camVideoProducer.value.replaceTrack({
          track: state.videoStream.value!.getVideoTracks()[0]
        })
      }
      if (state.videoStream.value!.active) {
        state.videoPaused.set(state.camVideoProducer.value != null)
        return true
      }
      state.videoPaused.set(true)
      return false
    } catch (err) {
      logger.error(err, 'Failed to get video stream')
    }
    return false
  },

  /**
   * Get user video stream.
   * @returns Whether stream is active or not.
   */
  async getAudioStream() {
    const state = getMutableState(MediaStreamState)
    try {
      logger.info('Getting audio stream %o', localAudioConstraints)
      const audioStream = await navigator.mediaDevices.getUserMedia(localAudioConstraints)
      if (!audioStream.active) {
        state.audioStream.set(null)
        return false
      }
      state.audioStream.set(audioStream)
      if (state.camAudioProducer.value && !state.camAudioProducer.value.closed)
        await state.camAudioProducer.value.replaceTrack({
          track: state.audioStream.value!.getAudioTracks()[0]
        })
      if (state.audioStream.value!.active) {
        state.audioPaused.set(state.camAudioProducer.value != null)
        return true
      }
      state.audioPaused.set(true)
      return false
    } catch (err) {
      logger.error(err, 'Failed to get audio stream')
    }
    return false
  }
}
