import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./LoadingUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./AvatarUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./MainMenuButtonsSystem')
  }
]
