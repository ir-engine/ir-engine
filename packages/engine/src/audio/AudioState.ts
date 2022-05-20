import { createState, useState } from '@speigg/hookstate'

import { dispatchAction } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { Engine } from '../ecs/classes/Engine'
import { AudioSettingKeys } from './AudioSettingConstants'

type AudioStateType = {
  audio: number
  microphone: number
}

const state = createState<AudioStateType>({
  audio: 10,
  microphone: 50
})

export async function restoreAudioSettings(): Promise<void> {
  if (typeof window !== 'undefined') {
    const s = {} as AudioStateType
    const promises = [
      ClientStorage.get(AudioSettingKeys.AUDIO).then((v) => {
        if (typeof v !== 'undefined') s.audio = v as number
        ClientStorage.set(AudioSettingKeys.AUDIO, state.audio.value)
      }),
      ClientStorage.get(AudioSettingKeys.MICROPHONE).then((v) => {
        if (typeof v !== 'undefined') s.microphone = v as number
        ClientStorage.set(AudioSettingKeys.MICROPHONE, state.microphone.value)
      })
    ]
    await Promise.all(promises)
    dispatchAction(Engine.instance.store, AudioSettingAction.restoreStorageData(s))
  }
}

export const useAudioState = () => useState(state) as any as typeof state
export const accessAudioState = () => state

export function AudioSettingReceptor(action: AudioActionType) {
  state.batch((s) => {
    switch (action.type) {
      case 'AUDIO_VOLUME':
        s.merge({ audio: action.audio })
        ClientStorage.set(AudioSettingKeys.AUDIO, action.audio)
        break
      case 'MICROPHONE_VOLUME':
        s.merge({ microphone: action.microphone })
        ClientStorage.set(AudioSettingKeys.MICROPHONE, action.microphone)
        break
      case 'RESTORE_AUDIO_STORAGE_DATA':
        s.merge(action.state)
    }

    return s
  })
}

export const AudioSettingAction = {
  setAudio: (audio: number) => {
    return {
      store: 'ENGINE' as const,
      type: 'AUDIO_VOLUME' as const,
      audio
    }
  },
  setMicrophone: (microphone: number) => {
    return {
      store: 'ENGINE' as const,
      type: 'MICROPHONE_VOLUME' as const,
      microphone
    }
  },
  restoreStorageData: (state: AudioStateType) => {
    return {
      store: 'ENGINE' as const,
      type: 'RESTORE_AUDIO_STORAGE_DATA' as const,
      state
    }
  }
}

export type AudioActionType = ReturnType<typeof AudioSettingAction[keyof typeof AudioSettingAction]>
