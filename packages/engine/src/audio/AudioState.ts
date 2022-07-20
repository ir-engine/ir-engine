import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { AudioSettingKeys } from './AudioSettingConstants'

type AudioStateType = {
  audio: number
  microphone: number
  mediaStreamVolume: number
  notificationVolume: number
  soundEffectsVolume: number
  backgroundMusicVolume: number
}

const AudioState = defineState({
  name: 'AudioState',
  initial: () => ({
    audio: 10,
    microphone: 50,
    mediaStreamVolume: 50,
    notificationVolume: 50,
    soundEffectsVolume: 50,
    backgroundMusicVolume: 50
  })
})

export async function restoreAudioSettings(): Promise<void> {
  if (typeof window !== 'undefined') {
    const s = {} as AudioStateType
    const promises = [
      ClientStorage.get(AudioSettingKeys.AUDIO).then((v) => {
        if (typeof v !== 'undefined') s.audio = v as number
      }),
      ClientStorage.get(AudioSettingKeys.MICROPHONE).then((v) => {
        if (typeof v !== 'undefined') s.microphone = v as number
      }),
      ClientStorage.get(AudioSettingKeys.MEDIA_STREAM_VOLUME).then((v) => {
        if (typeof v !== 'undefined') s.mediaStreamVolume = v as number
      }),
      ClientStorage.get(AudioSettingKeys.NOTIFICATION_VOLUME).then((v) => {
        if (typeof v !== 'undefined') s.notificationVolume = v as number
      }),
      ClientStorage.get(AudioSettingKeys.SOUND_EFFECT_VOLUME).then((v) => {
        if (typeof v !== 'undefined') s.soundEffectsVolume = v as number
      }),
      ClientStorage.get(AudioSettingKeys.BACKGROUND_MUSIC_VOLUME).then((v) => {
        if (typeof v !== 'undefined') s.backgroundMusicVolume = v as number
      })
    ]
    await Promise.all(promises)
    dispatchAction(AudioSettingAction.restoreStorageData({ state: s }))
  }
}

export const accessAudioState = () => getState(AudioState)
export const useAudioState = () => useState(accessAudioState())

export function AudioSettingReceptor(action) {
  getState(AudioState).batch((s) => {
    matches(action)
      .when(AudioSettingAction.setAudio.matches, (action) => {
        s.merge({ audio: action.audio })
        ClientStorage.set(AudioSettingKeys.AUDIO, action.audio)
      })
      .when(AudioSettingAction.setMicrophone.matches, (action) => {
        s.merge({ microphone: action.microphone })
        ClientStorage.set(AudioSettingKeys.MICROPHONE, action.microphone)
      })
      .when(AudioSettingAction.setMediaStreamVolume.matches, (action) => {
        s.merge({ mediaStreamVolume: action.mediastreamVolume })
        ClientStorage.set(AudioSettingKeys.MEDIA_STREAM_VOLUME, action.mediastreamVolume)
      })
      .when(AudioSettingAction.setNotification.matches, (action) => {
        s.merge({ notificationVolume: action.notificationVolume })
        ClientStorage.set(AudioSettingKeys.NOTIFICATION_VOLUME, action.notificationVolume)
      })
      .when(AudioSettingAction.setSoundEffectsVolume.matches, (action) => {
        s.merge({ soundEffectsVolume: action.soundEffectsVolume })
        ClientStorage.set(AudioSettingKeys.SOUND_EFFECT_VOLUME, action.soundEffectsVolume)
      })
      .when(AudioSettingAction.setBackgroundMusicVolume.matches, (action) => {
        s.merge({ backgroundMusicVolume: action.backgroundMusicVolume })
        ClientStorage.set(AudioSettingKeys.BACKGROUND_MUSIC_VOLUME, action.backgroundMusicVolume)
      })
      .when(AudioSettingAction.restoreStorageData.matches, (action) => {
        s.merge(action.state)
      })
  })
}

export class AudioSettingAction {
  static setAudio = defineAction({
    type: 'AUDIO_VOLUME' as const,
    audio: matches.number
  })

  static setMicrophone = defineAction({
    type: 'MICROPHONE_VOLUME' as const,
    microphone: matches.number
  })
  static setMediaStreamVolume = defineAction({
    type: 'MEDIA_STREAM_VOLUME' as const,
    mediastreamVolume: matches.number
  })
  static setNotification = defineAction({
    type: 'NOTIFICATION_VOLUME' as const,
    notificationVolume: matches.number
  })
  static setSoundEffectsVolume = defineAction({
    type: 'SOUND_EFFECT_VOLUME' as const,
    soundEffectsVolume: matches.number
  })
  static setBackgroundMusicVolume = defineAction({
    type: 'BACKGROUND_MUSIC_VOLUME' as const,
    backgroundMusicVolume: matches.number
  })

  static restoreStorageData = defineAction({
    type: 'RESTORE_AUDIO_STORAGE_DATA' as const,
    state: matches.object as Validator<unknown, AudioStateType>
  })
}
