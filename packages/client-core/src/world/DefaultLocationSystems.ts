import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    uuid: 'xre.client.core.LoadingUISystem',
    type: 'PRE_RENDER',
    systemLoader: () => import('../systems/LoadingUISystem')
  },
  {
    uuid: 'xre.client.core.AvatarUISystem',
    type: 'PRE_RENDER',
    systemLoader: () => import('../systems/AvatarUISystem')
  },
  // TODO: optimize this system; it crashes mobile/iOS
  // {
  //   uuid: 'xre.client.core.WidgetUISystem',
  //   type: 'PRE_RENDER',
  //   systemLoader: () => import('../systems/WidgetUISystem')
  // },
  {
    uuid: 'xre.client.core.PartySystem',
    type: 'PRE_RENDER',
    systemLoader: () => import('../systems/state/PartySystem')
  },
  {
    uuid: 'xre.client.core.PortalLoadSystem',
    type: 'FIXED',
    systemLoader: () => import('../systems/PortalLoadSystem')
  },
  {
    uuid: 'xre.client.core.UpdateNearbyUsersSystem',
    type: 'FIXED',
    systemLoader: () => import('../transports/UpdateNearbyUsersSystem')
  }
]
