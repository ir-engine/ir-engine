import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, syncStateWithLocalStorage } from '@xrengine/hyperflux'

import { AudioState } from '../audio/AudioState'
import { Engine } from '../ecs/classes/Engine'
import { XRState } from '../xr/XRState'

/**
 * All values ranged from 0 to 1
 */
export const MediaSettingsState = defineState({
  name: 'MediaSettingsState',
  initial: () => ({
    /** @todo implement UI setting for changing immersiveMediaMode */
    immersiveMediaMode: 'auto' as 'auto' | 'on' | 'off'
  }),
  onCreate: () => {
    syncStateWithLocalStorage(MediaSettingsState, ['immersiveMediaMode'])
  }
})

export function MediaSettingReceptor(action) {
  const s = getState(MediaSettingsState)
  matches(action).when(MediaSettingAction.setImmersiveMediaMode.matches, (action) => {
    s.merge({ immersiveMediaMode: action.mode as 'auto' | 'on' | 'off' })
  })
}

export class MediaSettingAction {
  static setImmersiveMediaMode = defineAction({
    type: 'xre.media.MediaSetting.IMMERSIVE_MEDIA_MODE' as const,
    mode: matches.string
  })
}

export const shouldUseImmersiveMedia = () => {
  const xrSessionActive = getState(XRState).sessionActive.value
  const audioState = getState(AudioState)
  const sceneMetadata = Engine.instance.currentWorld.sceneMetadata.mediaSettings
  const mediaSettingState = getState(MediaSettingsState)
  const immersiveMedia =
    mediaSettingState.immersiveMediaMode.value === 'on' ||
    (mediaSettingState.immersiveMediaMode.value === 'auto' && sceneMetadata.immersiveMedia.value)
  return immersiveMedia || audioState.usePositionalMedia.value || xrSessionActive
}
