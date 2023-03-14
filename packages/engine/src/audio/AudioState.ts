import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  defineAction,
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useState
} from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'

/**
 * All values ranged from 0 to 1
 */
export const AudioState = defineState({
  name: 'AudioState',
  initial: () => ({
    audioContext: null! as AudioContext,
    cameraGainNode: null! as GainNode,
    gainNodeMixBuses: {
      mediaStreams: null! as GainNode,
      notifications: null! as GainNode,
      music: null! as GainNode,
      soundEffects: null! as GainNode
    },
    masterVolume: 0.5,
    microphoneGain: 0.5,
    positionalMedia: false,
    usePositionalMedia: 'auto' as 'auto' | 'off' | 'on',
    mediaStreamVolume: 0.5,
    notificationVolume: 0.5,
    soundEffectsVolume: 0.2,
    backgroundMusicVolume: 0.2
  }),
  onCreate: () => {
    syncStateWithLocalStorage(AudioState, [
      'masterVolume',
      'microphoneGain',
      'positionalMedia',
      'mediaStreamVolume',
      'notificationVolume',
      'soundEffectsVolume',
      'backgroundMusicVolume'
    ])
  }
})
/**@deprecated use getMutableState directly instead */
export const accessAudioState = () => getMutableState(AudioState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useAudioState = () => useState(accessAudioState())

export function AudioSettingReceptor(action) {
  const s = getMutableState(AudioState)
  matches(action)
    .when(AudioSettingAction.setMasterVolume.matches, (action) => {
      s.masterVolume.set(action.value)
      s.cameraGainNode.value.gain.setTargetAtTime(action.value, s.audioContext.value.currentTime, 0.01)
    })
    .when(AudioSettingAction.setMicrophoneVolume.matches, (action) => {
      s.microphoneGain.set(action.value)
    })
    .when(AudioSettingAction.setUsePositionalMedia.matches, (action) => {
      s.positionalMedia.set(action.value)
    })
    .when(AudioSettingAction.setMediaStreamVolume.matches, (action) => {
      s.mediaStreamVolume.set(action.value)
      s.gainNodeMixBuses.value.mediaStreams.gain.setTargetAtTime(action.value, s.audioContext.value.currentTime, 0.01)
    })
    .when(AudioSettingAction.setNotificationVolume.matches, (action) => {
      s.notificationVolume.set(action.value)
      s.gainNodeMixBuses.value.notifications.gain.setTargetAtTime(action.value, s.audioContext.value.currentTime, 0.01)
    })
    .when(AudioSettingAction.setSoundEffectsVolume.matches, (action) => {
      s.soundEffectsVolume.set(action.value)
      s.gainNodeMixBuses.value.soundEffects.gain.setTargetAtTime(action.value, s.audioContext.value.currentTime, 0.01)
    })
    .when(AudioSettingAction.setMusicVolume.matches, (action) => {
      s.backgroundMusicVolume.set(action.value)
      s.gainNodeMixBuses.value.music.gain.setTargetAtTime(action.value, s.audioContext.value.currentTime, 0.01)
    })
}

export class AudioSettingAction {
  static setMasterVolume = defineAction({
    type: 'xre.audio.AudioSetting.MASTER_VOLUME' as const,
    value: matches.number
  })
  static setMicrophoneVolume = defineAction({
    type: 'xre.audio.AudioSetting.MICROPHONE_VOLUME' as const,
    value: matches.number
  })
  static setUsePositionalMedia = defineAction({
    type: 'xre.audio.AudioSetting.POSITIONAL_MEDIA' as const,
    value: matches.boolean
  })
  static setMediaStreamVolume = defineAction({
    type: 'xre.audio.AudioSetting.MEDIA_STREAM_VOLUME' as const,
    value: matches.number
  })
  static setNotificationVolume = defineAction({
    type: 'xre.audio.AudioSetting.NOTIFICATION_VOLUME' as const,
    value: matches.number
  })
  static setSoundEffectsVolume = defineAction({
    type: 'xre.audio.AudioSetting.SOUND_EFFECT_VOLUME' as const,
    value: matches.number
  })
  static setMusicVolume = defineAction({
    type: 'xre.audio.AudioSetting.BACKGROUND_MUSIC_VOLUME' as const,
    value: matches.number
  })
}

export const getPositionalMedia = () => {
  const audioState = getMutableState(AudioState)
  return audioState.usePositionalMedia.value === 'auto'
    ? audioState.positionalMedia.value
    : audioState.usePositionalMedia.value === 'on'
}
