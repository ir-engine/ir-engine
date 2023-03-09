import { SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'

import WebcamInputSystem from '../media/webcam/WebcamInput'
import AvatarUISystem from '../systems/AvatarUISystem'
import LoadingUISystem from '../systems/LoadingUISystem'
import PortalLoadSystem from '../systems/PortalLoadSystem'
import PartySystem from '../systems/state/PartySystem'
import WidgetUISystem from '../systems/WidgetUISystem'
import UpdateNearbyUsersSystem from '../transports/UpdateNearbyUsersSystem'

export const DefaultLocationSystems: SystemModuleType<any>[] = [
  {
    uuid: 'xre.client.core.LoadingUISystem',
    type: 'UPDATE',
    systemLoader: () => Promise.resolve({ default: LoadingUISystem })
  },
  {
    uuid: 'xre.client.core.AvatarUISystem',
    type: 'UPDATE',
    systemLoader: () => Promise.resolve({ default: AvatarUISystem })
  },
  {
    uuid: 'xre.client.core.WidgetUISystem',
    type: 'UPDATE',
    systemLoader: () => Promise.resolve({ default: WidgetUISystem })
  },
  {
    uuid: 'xre.client.core.PartySystem',
    type: 'PRE_RENDER',
    systemLoader: () => Promise.resolve({ default: PartySystem })
  },
  {
    uuid: 'xre.client.core.PortalLoadSystem',
    type: 'FIXED',
    systemLoader: () => Promise.resolve({ default: PortalLoadSystem })
  },
  {
    uuid: 'xre.client.core.UpdateNearbyUsersSystem',
    type: 'FIXED',
    systemLoader: () => Promise.resolve({ default: UpdateNearbyUsersSystem })
  },
  {
    uuid: 'xre.client.core.WebcamInputSystem',
    type: 'UPDATE_EARLY',
    systemLoader: () => Promise.resolve({ default: WebcamInputSystem })
  }
]
