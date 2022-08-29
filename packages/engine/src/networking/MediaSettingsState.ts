import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'

const AudioSettingDBPrefix = 'media-settings-'
const MediaSettings = {
  MODE: AudioSettingDBPrefix + 'MODE'
}

/**
 * All values ranged from 0 to 1
 */
export const MediaSettingsState = defineState({
  name: 'MediaSettingsState',
  initial: () => ({
    /** @todo implement UI setting for changing immersiveMediaMode */
    immersiveMediaMode: 'auto' as 'auto' | 'on' | 'off',
    useImmersiveMedia: false
  })
})

export function restoreMediaSettings() {
  ClientStorage.get(MediaSettings.MODE).then((v: string) => {
    if (typeof v !== 'undefined') dispatchAction(MediaSettingAction.setImmersiveMediaMode({ mode: v }))
  })
}

export function MediaSettingReceptor(action) {
  const s = getState(MediaSettingsState)
  matches(action)
    .when(MediaSettingAction.setImmersiveMediaMode.matches, (action) => {
      s.merge({ immersiveMediaMode: action.mode as 'auto' | 'on' | 'off' })
      ClientStorage.set(MediaSettings.MODE, action.mode)
    })
    .when(MediaSettingAction.setUseImmersiveMedia.matches, (action) => {
      s.merge({ useImmersiveMedia: action.use })
    })
}

export class MediaSettingAction {
  static setImmersiveMediaMode = defineAction({
    type: 'core.mediaSettings.IMMERSIVE_MEDIA_MODE' as const,
    mode: matches.string
  })
  static setUseImmersiveMedia = defineAction({
    type: 'core.mediaSettings.USE_IMMERSIVE_MEDIA' as const,
    use: matches.boolean
  })
}
