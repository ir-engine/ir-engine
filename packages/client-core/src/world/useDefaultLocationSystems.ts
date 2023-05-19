import { useEffect } from 'react'

import { InputSystemGroup, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'

import { WebcamInputSystem } from '../media/webcam/WebcamInput'
import { ClientNetworkingSystem } from '../networking/ClientNetworkingSystem'
import { AvatarUISystem } from '../systems/AvatarUISystem'
import { LoadingUISystem } from '../systems/LoadingUISystem'
import { WarningUISystem } from '../systems/WarningUISystem'
import { WidgetUISystem } from '../systems/WidgetUISystem'
import { UpdateNearbyUsersSystem } from '../transports/UpdateNearbyUsersSystem'
import { UserUISystem } from '../user/UserUISystem'

export const useDefaultLocationSystems = (online: boolean) => {
  useEffect(() => {
    startSystems([WebcamInputSystem], { with: InputSystemGroup })

    startSystems([LoadingUISystem, AvatarUISystem, WidgetUISystem], { before: TransformSystem })

    const postPresentationSystems = [UserUISystem, UpdateNearbyUsersSystem, WarningUISystem]

    if (online) postPresentationSystems.push(ClientNetworkingSystem)

    startSystems(postPresentationSystems, { after: PresentationSystemGroup })
  }, [])
}
