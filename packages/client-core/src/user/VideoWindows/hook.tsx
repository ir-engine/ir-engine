/*
CPAL-1.0 License
The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.
Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.
The Original Code is Infinite Reality Engine.
The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.
All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { DrawingUtils } from '@mediapipe/tasks-vision'
import hark from 'hark'
import { t } from 'i18next'
import React, { RefObject, useEffect, useRef } from 'react'

import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useFind, useGet } from '@ir-engine/common'
import { userAvatarPath, UserName, userPath } from '@ir-engine/common/src/schema.type.module'
import { useExecute } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { MotionCaptureSystem, timeSeriesMocapData } from '@ir-engine/engine/src/mocap/MotionCaptureSystem'
import { applyScreenshareToTexture } from '@ir-engine/engine/src/scene/functions/applyScreenshareToTexture'
import {
  getMutableState,
  getState,
  MediaChannelState,
  MediaStreamInterface,
  MediaStreamState,
  NetworkState,
  NO_PROXY,
  PeerID,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  useHookstate,
  useMutableState,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { drawPoseToCanvas } from '@ir-engine/ui/src/pages/Capture'

import { useUserAvatarThumbnail } from '../../hooks/useUserAvatarThumbnail'

export interface WindowType {
  peerID: PeerID
  type: 'screen' | 'cam'
}

import _ from 'lodash'

function addItem<T>(array: readonly T[], i: number, value: T): T[] {
  const newArray = [...array]

  newArray[i] = value

  return newArray
}

export const useUserMediaWindowsHook = (windows: WindowType[]) => {
  const mediaChannelState = useHookstate(getMutableState(MediaChannelState))
  const mediaStreamState = useMutableState(MediaStreamState)
  const mediaSettingState = useMutableState(MediaSettingsState)

  const soundIndicators = useHookstate<boolean[]>([])
  const isPiP = useHookstate(false)
  const resumeVideoOnUnhide = useRef<boolean>(false)
  const resumeAudioOnUnhide = useRef<boolean>(false)
  const audioState = useMutableState(AudioState)
  const volumes = useHookstate<number[]>([])

  const harkListeners = useHookstate<ReturnType<typeof hark>[]>([])

  const selfUser = useMutableState(AuthState).user.get(NO_PROXY)
  const mediaNetwork = NetworkState.mediaNetwork
  const rendered = !mediaSettingState.immersiveMedia.value

  const userIdsByPeerId = {}

  const peers = mediaNetwork?.peers || {}

  _.forEach(peers, ({ userId }, peerID) => {
    userIdsByPeerId[peerID] = userId
  })

  const userIds = _.uniq(
    _.map(userIdsByPeerId, (userId, peerID) => {
      return userId
    })
  )

  const users = useFind(userPath, { query: { id: { $in: userIds } } })?.data
  const avatarThumbnails = useFind(userAvatarPath, { query: { id: { $in: userIds } } })?.data

  const _windows = windows
    .map(({ peerID, type }, i) => {
      const audioChannelType = type === 'screen' ? screenshareAudioMediaChannelType : webcamAudioMediaChannelType
      const videoChannelType = type === 'screen' ? screenshareVideoMediaChannelType : webcamVideoMediaChannelType

      const peerMediaChannelState = mediaChannelState.value[peerID]

      const audioMediaChannelState = peerMediaChannelState[audioChannelType]
      const videoMediaChannelState = peerMediaChannelState[videoChannelType]

      const {
        stream: audioMediaStream,
        paused: audioStreamPaused,
        element: audioElement
      } = audioMediaChannelState as MediaStreamInterface

      const {
        stream: videoMediaStream,
        paused: videoStreamPaused,
        element: videoElement
      } = videoMediaChannelState as MediaStreamInterface

      const isSelf =
        !mediaNetwork ||
        peerID === Engine.instance.store.peerID ||
        (mediaNetwork?.peers &&
          Object.values(mediaNetwork.peers).find((peer) => peer.userId === selfUser.id)?.peerID === peerID) ||
        peerID === 'self'

      const userId = isSelf ? selfUser?.id : userIdsByPeerId[peerID]
      const user = users.find(({ id }) => id === userId)

      const _volume = volumes.value[i] || 1

      const volume = isSelf ? audioState.microphoneGain.value : _volume
      const isScreen = type === 'screen'

      if (isScreen) {
        mediaChannelState[peerID][videoChannelType].quality.set('largest')
      }

      const getUsername = () => {
        if (isSelf && !isScreen) return t('user:person.you')
        if (isSelf && isScreen) return t('user:person.yourScreen')
        const username = user?.name ?? 'A User'
        if (!isSelf && isScreen) return username + "'s Screen"
        return username
      }

      const username = getUsername() as UserName
      const avatarThumbnail = avatarThumbnails.find((avatar) => {
        return (avatar.userId = userId)
      })

      const toggleVideo = async () => {
        if (isSelf && !isScreen) {
          MediaStreamState.toggleWebcamPaused()
        } else if (isSelf && isScreen) {
          MediaStreamState.toggleScreenshareVideoPaused()
        } else {
          mediaChannelState[peerID][videoChannelType].paused.set((val) => !val)
        }
      }

      const toggleAudio = async () => {
        if (isSelf && !isScreen) {
          MediaStreamState.toggleMicrophonePaused()
        } else if (isSelf && isScreen) {
          MediaStreamState.toggleScreenshareAudioPaused()
        } else {
          mediaChannelState[peerID][audioChannelType].paused.set((val) => !val)
        }
      }

      const adjustVolume = (e, value) => {
        if (isSelf) {
          getMutableState(AudioState).microphoneGain.set(value)
        } else {
          audioElement!.volume = value
        }

        volumes.set(addItem(volumes.value, i, value))
      }

      const handleVisibilityChange = () => {
        if (document.hidden) {
          if (!videoStreamPaused && mediaStreamState.webcamMediaStream.value) {
            resumeVideoOnUnhide.current = true
            mediaChannelState[peerID][videoChannelType].paused.set(true)
            toggleVideo()
          }
          if (!audioStreamPaused && mediaStreamState.microphoneMediaStream.value) {
            resumeAudioOnUnhide.current = true
            mediaChannelState[peerID][audioChannelType].paused.set(true)
            toggleAudio()
          }
        }
        if (!document.hidden) {
          if (resumeVideoOnUnhide.current) {
            mediaChannelState[peerID][videoChannelType].paused.set(false)
            toggleVideo()
          }
          if (resumeAudioOnUnhide.current) {
            mediaChannelState[peerID][audioChannelType].paused.set(false)
            toggleAudio()
          }
          resumeVideoOnUnhide.current = false
          resumeAudioOnUnhide.current = false
        }
      }

      const switchQualityByPiP = () => {
        mediaChannelState[peerID][videoChannelType].quality.set(isPiP.value ? 'largest' : 'smallest')
      }

      const play = () => {
        videoElement?.play()
        audioElement?.play()
        harkListeners.value[i]?.resume()
      }

      const handleHark = (mounted) => {
        if (!audioMediaStream || !audioMediaStream.getAudioTracks().length) return

        audioElement.id = `${peerID}_audio`
        audioElement.autoplay = true
        audioElement.setAttribute('playsinline', 'true')
        audioElement.muted = audioStreamPaused || isSelf
        audioElement.volume = audioStreamPaused || isSelf ? 0 : volume

        audioElement.srcObject = audioMediaStream

        const newHark = hark(audioElement.srcObject, { play: false })
        newHark.on('speaking', () => {
          if (mounted) return

          soundIndicators.set(addItem(soundIndicators.value, i, true))
        })
        newHark.on('stopped_speaking', () => {
          if (mounted) return
          soundIndicators.set(addItem(soundIndicators.value, i, false))
        })
        harkListeners.set(addItem(harkListeners.value, i, newHark))

        return newHark
      }

      const handleAudioPause = () => {
        audioElement.muted = audioStreamPaused || isSelf
        audioElement.volume = _volume
      }

      const handleScreenshareTexture = () => {
        if (!videoMediaStream) return

        videoElement.id = `${peerID}_video`
        videoElement.autoplay = true
        videoElement.muted = true
        videoElement.setAttribute('playsinline', 'true')
        videoElement.srcObject = videoMediaStream

        if (isScreen) {
          applyScreenshareToTexture(videoElement as HTMLVideoElement)
        }
      }

      return {
        peerID,
        type,
        handleVisibilityChange,
        adjustVolume,
        toggleVideo,
        toggleAudio,
        harkListeners,
        audioElement,
        videoElement,
        audioMediaStream,
        videoMediaStream,
        audioStreamPaused,
        isSelf,
        isScreen,
        switchQualityByPiP,
        play,
        handleHark,
        handleAudioPause,
        handleScreenshareTexture
      }
    })
    .filter(({ audioMediaStream, videoMediaStream }) => {
      return audioMediaStream || videoMediaStream
    })

  const videoMediaStreams = _windows.map(({ videoMediaStream }) => {
    return videoMediaStream
  })

  const audioMediaStreams = _windows.map(({ audioMediaStream }) => {
    return audioMediaStream
  })

  const audioStreamPauseds = _windows.map(({ audioStreamPaused }) => {
    return audioStreamPaused
  })

  const videoElements = _windows.map(({ videoElement }) => {
    return videoElement
  })

  const audioElements = _windows.map(({ audioElement }) => {
    return audioElement
  })

  const togglePiP = () => isPiP.set(!isPiP.value)

  useEffect(() => {
    mediaStreamState.microphoneGainNode.value?.gain.setTargetAtTime(
      audioState.microphoneGain.value,
      audioState.audioContext.currentTime.value,
      0.01
    )
  }, [audioState.microphoneGain.value])

  useEffect(() => {
    function onUserInteraction() {
      _windows.forEach(({ play }) => play())
    }
    window.addEventListener('pointerup', onUserInteraction)
    return () => {
      window.removeEventListener('pointerup', onUserInteraction)
    }
  }, [videoElements, audioElements])

  useEffect(() => {
    if (!audioMediaStreams.length) {
      return
    }

    let mounted = _windows.map(() => false)

    const newHarks = _windows.map(({ handleHark }, i) => {
      return handleHark(mounted[i])
    })

    return () => {
      mounted = mounted.map(() => true)
      newHarks.map((newHark) => {
        newHark?.stop()
      })
    }
  }, [audioMediaStreams])

  useEffect(() => {
    _windows.map(({ handleAudioPause }) => handleAudioPause())
  }, [audioStreamPauseds])

  useEffect(() => {
    _windows.map(({ handleScreenshareTexture }) => handleScreenshareTexture())
  }, [videoMediaStreams])

  useEffect(() => {
    _windows.map(({ switchQualityByPiP }) => switchQualityByPiP())
  }, [isPiP.value])

  useEffect(() => {
    const handleVisibilityChange = () => {
      _windows.forEach(({ handleVisibilityChange }) => handleVisibilityChange())
    }

    if (isMobile) {
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [_windows])

  return { videoElements, videoMediaStreams }
}

export const useUserMediaWindowHook = ({ peerID, type }: WindowType) => {
  const audioChannelType = type === 'screen' ? screenshareAudioMediaChannelType : webcamAudioMediaChannelType
  const videoChannelType = type === 'screen' ? screenshareVideoMediaChannelType : webcamVideoMediaChannelType
  const audioMediaChannelState = useHookstate(getMutableState(MediaChannelState)[peerID][audioChannelType])
  const videoMediaChannelState = useHookstate(getMutableState(MediaChannelState)[peerID][videoChannelType])
  const {
    stream: audioMediaStream,
    paused: audioStreamPaused,
    element: audioElement
  } = audioMediaChannelState.value as MediaStreamInterface
  const {
    stream: videoMediaStream,
    paused: videoStreamPaused,
    element: videoElement
  } = videoMediaChannelState.value as MediaStreamInterface

  const harkListener = useHookstate(null as ReturnType<typeof hark> | null)
  const soundIndicatorOn = useHookstate(false)
  const isPiP = useHookstate(false)

  const resumeVideoOnUnhide = useRef<boolean>(false)
  const resumeAudioOnUnhide = useRef<boolean>(false)

  const audioState = useMutableState(AudioState)

  const _volume = useHookstate(1)

  const selfUser = useMutableState(AuthState).user.get(NO_PROXY)
  // const currentLocation = useMutableState(LocationState).currentLocation.location
  /** @todo refactor global mute for admin controls */
  // const enableGlobalMute =
  //   currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
  //   selfUser?.locationAdmins?.find((locationAdmin) => currentLocation?.id?.value === locationAdmin.locationId) != null

  const mediaNetwork = NetworkState.mediaNetwork
  const isSelf =
    !mediaNetwork ||
    peerID === Engine.instance.store.peerID ||
    (mediaNetwork?.peers &&
      Object.values(mediaNetwork.peers).find((peer) => peer.userId === selfUser.id)?.peerID === peerID) ||
    peerID === 'self'
  const volume = isSelf ? audioState.microphoneGain.value : _volume.value
  const isScreen = type === 'screen'
  const userId = isSelf ? selfUser?.id : mediaNetwork?.peers?.[peerID]?.userId

  const mediaStreamState = useMutableState(MediaStreamState)
  const mediaSettingState = useMutableState(MediaSettingsState)
  const rendered = !mediaSettingState.immersiveMedia.value

  useEffect(() => {
    function onUserInteraction() {
      if (videoElement?.srcObject) videoElement.play()
      if (audioElement?.srcObject) audioElement.play()
      harkListener?.value?.resume()
    }
    window.addEventListener('pointerup', onUserInteraction)
    return () => {
      window.removeEventListener('pointerup', onUserInteraction)
    }
  }, [videoElement, audioElement, harkListener?.value])

  useEffect(() => {
    if (!audioMediaStream || !audioMediaStream.getAudioTracks().length) return

    audioElement.id = `${peerID}_audio`
    audioElement.autoplay = true
    audioElement.setAttribute('playsinline', 'true')
    audioElement.muted = audioStreamPaused || isSelf
    audioElement.volume = audioStreamPaused || isSelf ? 0 : volume * audioState.mediaStreamVolume.value

    audioElement.srcObject = audioMediaStream

    const newHark = hark(audioElement.srcObject, { play: false })
    newHark.on('speaking', () => {
      if (unmounted) return
      soundIndicatorOn.set(true)
    })
    newHark.on('stopped_speaking', () => {
      if (unmounted) return
      soundIndicatorOn.set(false)
    })
    harkListener.set(newHark)

    let unmounted = false

    return () => {
      unmounted = true
      newHark.stop()
    }
  }, [audioMediaStream, audioState.mediaStreamVolume])

  useEffect(() => {
    audioElement.muted = audioStreamPaused || isSelf
    audioElement.volume = volume
  }, [audioStreamPaused])

  useEffect(() => {
    if (!videoMediaStream) return

    videoElement.id = `${peerID}_video`
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.setAttribute('playsinline', 'true')
    videoElement.srcObject = videoMediaStream

    if (isScreen) {
      applyScreenshareToTexture(videoElement as HTMLVideoElement)
    }
  }, [videoMediaStream])

  useEffect(() => {
    mediaStreamState.microphoneGainNode.value?.gain.setTargetAtTime(
      audioState.microphoneGain.value,
      audioState.audioContext.currentTime.value,
      0.01
    )
  }, [audioState.microphoneGain.value])

  const toggleVideo = async () => {
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      videoMediaChannelState.paused.set((val) => !val)
    }
  }

  const toggleAudio = async () => {
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      audioMediaChannelState.paused.set((val) => !val)
    }
  }

  const toggleGlobalMute = async (e) => {
    e.stopPropagation()
    /** @todo */
    // const mediaNetwork = NetworkState.mediaNetwork
    // const audioStreamProducer = audioStream as ConsumerExtension
    // if (!audioProducerGlobalMute) {
    //   MediasoupMediaProducerConsumerState.globalMuteProducer(mediaNetwork, audioStreamProducer.producerId)
    //   peerMediaChannelState.audioProducerGlobalMute.set(true)
    // } else if (audioProducerGlobalMute) {
    //   MediasoupMediaProducerConsumerState.globalUnmuteProducer(mediaNetwork, audioStreamProducer.producerId)
    //   peerMediaChannelState.audioProducerGlobalMute.set(false)
    // }
  }

  const adjustVolume = (e, value) => {
    if (isSelf) {
      getMutableState(AudioState).microphoneGain.set(value)
    } else {
      audioElement!.volume = value
    }
    _volume.set(value)
  }

  const user = useGet(userPath, userId)

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = user.data?.name ?? 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const togglePiP = () => isPiP.set(!isPiP.value)

  useEffect(() => {
    videoMediaChannelState.quality.set(isPiP.value ? 'largest' : 'smallest')
  }, [isPiP.value])

  const username = getUsername() as UserName

  const avatarThumbnail = useUserAvatarThumbnail(userId)

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (!videoStreamPaused && mediaStreamState.webcamMediaStream.value) {
        resumeVideoOnUnhide.current = true
        videoMediaChannelState.paused.set(true)
        toggleVideo()
      }
      if (!audioStreamPaused && mediaStreamState.microphoneMediaStream.value) {
        resumeAudioOnUnhide.current = true
        audioMediaChannelState.paused.set(true)
        toggleAudio()
      }
    }
    if (!document.hidden) {
      if (resumeVideoOnUnhide.current) {
        videoMediaChannelState.paused.set(false)
        toggleVideo()
      }
      if (resumeAudioOnUnhide.current) {
        audioMediaChannelState.paused.set(false)
        toggleAudio()
      }
      resumeVideoOnUnhide.current = false
      resumeAudioOnUnhide.current = false
    }
  }

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  return {
    isPiP: isPiP.value,
    volume,
    isScreen,
    username,
    selfUser,
    isSelf,
    videoMediaStream,
    audioMediaStream,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    soundIndicatorOn: soundIndicatorOn.value,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    /** @todo reimplement global mute */
    // enableGlobalMute,
    // toggleGlobalMute,
    rendered
  }
}

const useDrawMocapLandmarks = (
  videoElement: HTMLVideoElement,
  canvasCtxRef: React.MutableRefObject<CanvasRenderingContext2D | undefined>,
  canvasRef: RefObject<HTMLCanvasElement>,
  peerID: PeerID
) => {
  let lastTimestamp = 0
  const drawingUtils = useHookstate(null as null | DrawingUtils)
  useEffect(() => {
    drawingUtils.set(new DrawingUtils(canvasCtxRef.current!))
    canvasRef.current!.style.transform = `scaleX(-1)`
  }, [])
  useExecute(
    () => {
      if (videoElement.paused || videoElement.ended || !videoElement.currentTime) return
      const networkState = getState(NetworkState)
      if (networkState.hostIds.world) {
        const network = networkState.networks[networkState.hostIds.world]
        if (network?.peers?.[peerID]) {
          const userID = network.peers[peerID].userId
          const peers = network.users[userID]
          for (const peer of peers) {
            const mocapBuffer = timeSeriesMocapData.get(peer)
            if (mocapBuffer) {
              const lastMocapResult = mocapBuffer.getLast()
              if (lastMocapResult && lastMocapResult.timestamp !== lastTimestamp) {
                lastTimestamp = lastMocapResult.timestamp
                drawingUtils.value &&
                  drawPoseToCanvas([lastMocapResult.results.landmarks], canvasCtxRef, canvasRef, drawingUtils.value)
                return
              }
            }
          }
        }
      }
    },
    { before: MotionCaptureSystem }
  )
}
