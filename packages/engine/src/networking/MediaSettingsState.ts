import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'

import { AudioState, getPositionalMedia } from '../audio/AudioState'
import { getMediaSceneMetadataState } from '../audio/systems/MediaSystem'
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
  const s = getMutableState(MediaSettingsState)
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
  const xrSessionActive = getMutableState(XRState).sessionActive.value
  const audioState = getMutableState(AudioState)
  const mediaState = getMediaSceneMetadataState(Engine.instance.currentScene)
  const mediaSettingState = getMutableState(MediaSettingsState)
  const immersiveMedia =
    mediaSettingState.immersiveMediaMode.value === 'on' ||
    (mediaSettingState.immersiveMediaMode.value === 'auto' && mediaState.immersiveMedia.value)
  return immersiveMedia || getPositionalMedia() || xrSessionActive
}
