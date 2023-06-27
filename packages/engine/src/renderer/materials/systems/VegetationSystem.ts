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
import { Vector3 } from 'three'

import { getMutableState, NO_PROXY, State } from '@etherealengine/hyperflux'

import { AvatarComponent } from '../../../avatar/components/AvatarComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { ComponentType, defineQuery, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../../ecs/functions/SystemFunctions'
import { setCallback } from '../../../scene/components/CallbackComponent'
import { UpdatableComponent } from '../../../scene/components/UpdatableComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { MaterialPluginType } from '../components/MaterialPluginComponent'
import { MaterialLibraryState } from '../MaterialLibrary'

const avatarQuery = defineQuery([AvatarComponent, TransformComponent])
let plugin: MaterialPluginType

const NUM_AVATARS = 8

const execute = () => {
  if (!plugin) return
  const clientPosition = Engine.instance.camera.position
  const avatarPositions = avatarQuery()
    .map((entity) => {
      const transform = getComponent(entity, TransformComponent)
      return transform.position
    })
    .sort((a, b) => a.distanceToSquared(clientPosition) - b.distanceToSquared(clientPosition))
  const closestAvatars = avatarPositions.slice(0, NUM_AVATARS)
  plugin.parameters['avatarPositions'] = [
    ...closestAvatars,
    ...Array(NUM_AVATARS - closestAvatars.length).fill(new Vector3())
  ]
}

const reactor = () => {
  const materialLibrary = getMutableState(MaterialLibraryState)
  useEffect(() => {
    plugin = materialLibrary.plugins['vegetation'].get(NO_PROXY)
  }, [])
  return null
}

export const VegetationPluginSystem = defineSystem({
  uuid: 'ee.engine.scene.VegetationPluginSystem',
  execute,
  reactor
})
