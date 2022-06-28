import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('../systems/LoadingUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('../systems/AvatarUISystem')
  },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('../systems/WidgetUISystem')
  },
  {
    type: 'FIXED',
    systemModulePromise: import('../transports/UpdateNearbyUsersSystem')
  }
]
