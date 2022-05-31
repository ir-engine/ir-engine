import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./XRUILoadingSystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./AvatarUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./MainMenuButtonsSystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./ChatUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./ShareLocationUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./SettingUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./EmoteUISystem')
  }
]
