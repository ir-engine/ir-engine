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
