/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PresentationSystemGroup, UUIDComponent, UndefinedEntity, defineSystem, getComponent } from '@ir-engine/ecs'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { teleportAvatar } from '@ir-engine/engine/src/avatar/functions/moveAvatar'
import { PortalComponent, PortalState } from '@ir-engine/engine/src/scene/components/PortalComponent'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { RouterState } from '../common/services/RouterService'
import { LocationService, LocationState } from '../social/services/LocationService'

export const reactor = () => {
  const locationState = useMutableState(LocationState)
  const portalState = useMutableState(PortalState)

  useEffect(() => {
    const activePortalEntity = portalState.activePortalEntity.value
    if (!activePortalEntity) return

    const activePortal = getComponent(activePortalEntity, PortalComponent)

    const currentLocation = locationState.locationName.value.split('/')[1]
    if (currentLocation === activePortal.location || UUIDComponent.getEntityByUUID(activePortal.linkedPortalId)) {
      teleportAvatar(
        AvatarComponent.getSelfAvatarEntity(),
        activePortal.remoteSpawnPosition,
        true
        // activePortal.remoteSpawnRotation
      )
      portalState.activePortalEntity.set(UndefinedEntity)
      return
    }

    if (activePortal.redirect) {
      window.location.href = getState(DomainConfigState).publicDomain + '/location/' + activePortal.location
      return
    }

    if (activePortal.effectType !== 'None') {
      PortalComponent.setPlayerInPortalEffect(activePortal.effectType)
    } else {
      getMutableState(PortalState).portalReady.set(true)
      // teleport player to where the portal spawn position is
      teleportAvatar(AvatarComponent.getSelfAvatarEntity(), activePortal.remoteSpawnPosition, true)
    }
  }, [portalState.activePortalEntity])

  useEffect(() => {
    if (!portalState.activePortalEntity.value || !portalState.portalReady.value) return

    const activePortalEntity = portalState.activePortalEntity.value
    const activePortal = getComponent(activePortalEntity, PortalComponent)

    RouterState.navigate('/location/' + activePortal.location)
    LocationService.getLocationByName(activePortal.location)

    if (activePortal.effectType === 'None') {
      getMutableState(PortalState).activePortalEntity.set(UndefinedEntity)
    }
  }, [portalState.portalReady])

  return null
}

export const PortalRedirectSystem = defineSystem({
  uuid: 'ir.client.world.PortalRedirectSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
