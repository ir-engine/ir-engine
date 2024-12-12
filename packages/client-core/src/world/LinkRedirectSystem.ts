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
