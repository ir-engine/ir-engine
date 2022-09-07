import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    uuid: 'core.client-core.LoadingUISystem',
    type: 'PRE_RENDER',
    systemModulePromise: () => import('../systems/LoadingUISystem')
  },
  {
    uuid: 'core.client-core.AvatarUISystem',
    type: 'PRE_RENDER',
    systemModulePromise: () => import('../systems/AvatarUISystem')
  },
  // TODO: optimize this system; it crashes mobile/iOS
  // {
  //   uuid: 'core.client-core.WidgetUISystem',
  //   type: 'PRE_RENDER',
  //   systemModulePromise: () => import('../systems/WidgetUISystem')
  // },
  {
    uuid: 'core.client-core.PartySystem',
    type: 'PRE_RENDER',
    systemModulePromise: () => import('../systems/state/PartySystem')
  },
  {
    uuid: 'core.client-core.PortalLoadSystem',
    type: 'FIXED',
    systemModulePromise: () => import('../systems/PortalLoadSystem')
  },
  {
    uuid: 'core.client-core.UpdateNearbyUsersSystem',
    type: 'FIXED',
    systemModulePromise: () => import('../transports/UpdateNearbyUsersSystem')
  }
]
