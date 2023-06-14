/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Euler, Texture } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PortalComponent } from '../components/PortalComponent'

export const enterPortal = async (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const portalDetails = (await Engine.instance.api.service('portal').get(portalComponent.linkedPortalId)).data!
  if (portalDetails) {
    portalComponent.remoteSpawnPosition.copy(portalDetails.spawnPosition)
    portalComponent.remoteSpawnRotation.setFromEuler(
      new Euler(
        portalDetails.spawnRotation.x,
        portalDetails.spawnRotation.y,
        portalDetails.spawnRotation.z,
        portalDetails.spawnRotation.order
      )
    )
    if (typeof portalComponent.previewImageURL !== 'undefined' && portalComponent.previewImageURL !== '') {
      if (portalComponent.mesh) {
        const texture = (await AssetLoader.loadAsync(portalDetails.previewImageURL)) as Texture
        if (!entityExists(entity)) return
        portalComponent.mesh.material.map = texture
      }
    }
  }
}

const portalQuery = defineQuery([PortalComponent])

const execute = () => {
  if (!isClient) return
  for (const entity of portalQuery.enter()) enterPortal(entity)
}

/**
 * Loads portal metadata once the models have been loaded. Depends on API calls.
 */
export const PortalLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.PortalLoadSystem',
  execute
})
