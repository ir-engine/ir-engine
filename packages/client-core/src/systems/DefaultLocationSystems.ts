import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./XRUILoadingSystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('./AvatarUISystem')
  }
]
