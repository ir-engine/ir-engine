import { PresentationSystemGroup, defineSystem } from '@ir-engine/ecs'
import { LinkState } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { RouterState } from '../common/services/RouterService'
import { LocationService } from '../social/services/LocationService'

export const reactor = () => {
  const linkState = useMutableState(LinkState)

  useEffect(() => {
    const location = linkState.location.value
    if (!location) return

    RouterState.navigate('/location/' + location)
    LocationService.getLocationByName(location)

    getMutableState(LinkState).location.set(undefined)
  }, [linkState.location.value])

  return null
}

export const LinkRedirectSystem = defineSystem({
  uuid: 'ir.client.world.LinkRedirectSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
