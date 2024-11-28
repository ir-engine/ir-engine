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
