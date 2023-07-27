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

import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  syncStateWithLocalStorage
} from '@etherealengine/hyperflux'

import { MediaSettingsState } from '../networking/MediaSettingsState'

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
    mediaStreamVolume: 1,
    notificationVolume: 1,
    soundEffectsVolume: 1,
    backgroundMusicVolume: 0.5
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
    //FIXME do this more gracefully than a hard setTimeout
    setTimeout(() => {
      getMutableState(MediaSettingsState).immersiveMedia.set(getState(AudioState).positionalMedia)
    }, 1000)
  }
})

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
      getMutableState(MediaSettingsState).immersiveMedia.set(action.value)
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
  const audioState = getState(AudioState)
  return audioState.usePositionalMedia === 'auto' ? audioState.positionalMedia : audioState.usePositionalMedia === 'on'
}
