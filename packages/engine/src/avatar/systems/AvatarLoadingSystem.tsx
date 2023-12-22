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
import { SRGBColorSpace } from 'three'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import React from 'react'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { QueryReactor, defineSystem } from '../../ecs/functions/SystemFunctions'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarDissolveComponent } from '../components/AvatarDissolveComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { SpawnEffectComponent } from '../components/SpawnEffectComponent'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'

const lightScale = (y, r) => {
  return Math.min(1, Math.max(1e-3, y / r))
}

const lightOpacity = (y, r) => {
  return Math.min(1, Math.max(0, 1 - (y - r) * 0.5))
}

const growQuery = defineQuery([SpawnEffectComponent])
const dissolveQuery = defineQuery([AvatarDissolveComponent])

const execute = () => {
  const delta = getState(EngineState).deltaSeconds

  for (const entity of growQuery()) {
    TransformComponent.dirtyTransforms[entity] = true

    const { opacityMultiplier, plateEntity, lightEntities } = getComponent(entity, SpawnEffectComponent)
    if (!plateEntity) continue

    const plate = getComponent(plateEntity, GroupComponent)[0] as typeof SpawnEffectComponent.plateMesh
    plate.material.opacity = opacityMultiplier * (0.7 + 0.5 * Math.sin((Date.now() % 6283) * 5e-3))

    for (const rayEntity of lightEntities) {
      const ray = getComponent(rayEntity, GroupComponent)[0] as typeof SpawnEffectComponent.lightMesh
      const rayTransform = getComponent(rayEntity, TransformComponent)
      rayTransform.position.y += 2 * delta
      rayTransform.scale.y = lightScale(rayTransform.position.y, ray.geometry.boundingSphere!.radius)
      ray.material.opacity = lightOpacity(rayTransform.position.y, ray.geometry.boundingSphere!.radius)

      if (ray.material.opacity < 1e-3) {
        rayTransform.position.y = plate.position.y
      }
      ray.material.opacity *= opacityMultiplier
    }
  }

  for (const entity of dissolveQuery()) {
    const effectComponent = getComponent(entity, AvatarDissolveComponent)
    AvatarDissolveComponent.updateDissolveEffect(effectComponent.dissolveMaterials, entity, delta)
  }
}

const AvatarPendingReactor = () => {
  const entity = useEntityContext()

  useEffect(() => {
    const effectEntity = createEntity()

    setComponent(effectEntity, SpawnEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1
    })

    return () => {
      SpawnEffectComponent.fadeOut(effectEntity)
    }
  }, [])

  return null
}

const reactor = () => {
  if (!isClient) return null

  const assetsReady = useHookstate(false)

  useEffect(() => {
    SpawnEffectComponent.lightMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.plateMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.lightMesh.name = 'light_obj'
    SpawnEffectComponent.plateMesh.name = 'plate_obj'

    AssetLoader.loadAsync('/static/itemLight.png').then((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.needsUpdate = true
      SpawnEffectComponent.lightMesh.material.map = texture
    })

    AssetLoader.loadAsync('/static/itemPlate.png').then((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.needsUpdate = true
      SpawnEffectComponent.plateMesh.material.map = texture
      assetsReady.set(true)
    })
  }, [])

  const loadingEffect = useHookstate(getMutableState(EngineState).avatarLoadingEffect)

  if (!loadingEffect.value || !assetsReady.value) return null

  return <QueryReactor Components={[AvatarPendingComponent]} ChildEntityReactor={AvatarPendingReactor} />
}

export const AvatarLoadingSystem = defineSystem({
  uuid: 'ee.engine.AvatarLoadingSystem',
  insert: { after: AvatarAnimationSystem },
  execute,
  reactor
})
