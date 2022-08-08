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
  // TODO: optimize this system; it crashes mobile/iOS
  // {
  //   type: 'PRE_RENDER',
  //   systemModulePromise: import('../systems/WidgetUISystem')
  // },
  {
    type: 'PRE_RENDER',
    systemModulePromise: import('../systems/state/PartySystem')
  },
  {
    type: 'FIXED',
    systemModulePromise: import('../transports/UpdateNearbyUsersSystem')
  }
]
