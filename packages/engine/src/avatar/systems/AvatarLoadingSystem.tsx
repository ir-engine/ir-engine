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

import React, { useEffect } from 'react'
import { SRGBColorSpace } from 'three'

import { getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { createEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { QueryReactor, defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getMutableState, getState, isClient, useHookstate } from '@ir-engine/hyperflux'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AnimationState } from '../AnimationManager'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarDissolveComponent } from '../components/AvatarDissolveComponent'
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
  const delta = getState(ECSState).deltaSeconds

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

  const gltf = useComponent(entity, GLTFComponent)

  useEffect(() => {
    if (gltf.progress.value === 100) return

    const loadingEffect = !getState(XRState).sessionActive && !iOS

    if (!isClient || !loadingEffect) return

    const avatarHeight = getComponent(entity, AvatarComponent).avatarHeight
    setComponent(entity, AvatarDissolveComponent, { height: avatarHeight })

    const effectEntity = createEntity()
    setComponent(effectEntity, SpawnEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1
    })

    return () => {
      SpawnEffectComponent.fadeOut(effectEntity)
    }
  }, [gltf.progress.value])

  return null
}

const reactor = () => {
  if (!isClient) return null

  const assetsReady = useHookstate(false)

  const [itemLight] = useTexture('/static/itemLight.png')
  const [itemPlate] = useTexture('/static/itemPlate.png')

  useEffect(() => {
    const texture = itemLight
    if (!texture) return

    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    SpawnEffectComponent.lightMesh.material.map = texture
  }, [itemLight])

  useEffect(() => {
    const texture = itemPlate
    if (!texture) return

    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    SpawnEffectComponent.plateMesh.material.map = texture
  }, [itemPlate])

  useEffect(() => {
    if (itemLight && itemPlate) assetsReady.set(true)
  }, [itemLight, itemPlate])

  useEffect(() => {
    SpawnEffectComponent.lightMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.plateMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.lightMesh.name = 'light_obj'
    SpawnEffectComponent.plateMesh.name = 'plate_obj'
  }, [])

  const loadingEffect = useHookstate(getMutableState(AnimationState).avatarLoadingEffect)

  if (!loadingEffect.value || !assetsReady.value) return null

  return <QueryReactor Components={[AvatarRigComponent, GLTFComponent]} ChildEntityReactor={AvatarPendingReactor} />
}

export const AvatarLoadingSystem = defineSystem({
  uuid: 'ee.engine.AvatarLoadingSystem',
  insert: { after: AvatarAnimationSystem },
  execute,
  reactor
})
