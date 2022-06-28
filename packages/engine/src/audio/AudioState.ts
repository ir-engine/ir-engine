import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { AudioSettingKeys } from './AudioSettingConstants'

type AudioStateType = {
  audio: number
  microphone: number
}

const AudioState = defineState({
  name: 'AudioState',
  initial: () => ({
    audio: 10,
    microphone: 50
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

  static restoreStorageData = defineAction({
    type: 'RESTORE_AUDIO_STORAGE_DATA' as const,
    state: matches.object as Validator<unknown, AudioStateType>
  })
}
