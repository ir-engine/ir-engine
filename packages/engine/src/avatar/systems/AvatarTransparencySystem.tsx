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

import {
  Engine,
  Entity,
  PresentationSystemGroup,
  UUIDComponent,
  defineQuery,
  defineSystem,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent,
  ditherCalculationType
} from '@ir-engine/spatial/src/renderer/materials/constants/plugins/TransparencyDitheringComponent'
import React, { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { SourceComponent } from '../../scene/components/SourceComponent'
import { AvatarComponent } from '../components/AvatarComponent'

const headDithering = 0
const cameraDithering = 1
const avatarQuery = defineQuery([AvatarComponent])
const execute = () => {
  const selfEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfEntity) return
  const cameraAttached = XRState.isCameraAttachedToAvatar

  for (const entity of avatarQuery()) {
    const transparencyDitheringRoot = getOptionalComponent(entity, TransparencyDitheringRootComponent)
    const materials = transparencyDitheringRoot?.materials
    if (!materials) setComponent(entity, TransparencyDitheringRootComponent, { materials: [] })

    const avatarComponent = getComponent(entity, AvatarComponent)
    const cameraComponent = getOptionalComponent(getState(EngineState).viewerEntity, FollowCameraComponent)

    if (!materials?.length) return
    for (const materialUUID of materials) {
      const pluginComponent = getOptionalComponent(
        UUIDComponent.getEntityByUUID(materialUUID),
        TransparencyDitheringPluginComponent
      )
      if (!pluginComponent) continue
      const viewerPosition = getComponent(Engine.instance.viewerEntity, TransformComponent).position
      pluginComponent.centers.value[cameraDithering].set(viewerPosition.x, viewerPosition.y, viewerPosition.z)
      pluginComponent.distances.value[cameraDithering] = cameraAttached ? 8 : 3
      pluginComponent.exponents.value[cameraDithering] = cameraAttached ? 10 : 6
      pluginComponent.useWorldCalculation.value[cameraDithering] = ditherCalculationType.worldTransformed
      if (entity !== selfEntity) {
        pluginComponent.distances.value[headDithering] = 10
        continue
      }
      pluginComponent.centers.value[headDithering].setY(avatarComponent.eyeHeight)
      pluginComponent.distances.value[headDithering] =
        cameraComponent && !cameraAttached ? Math.max(Math.pow(cameraComponent.distance * 5, 2.5), 3) : 3.5
      pluginComponent.exponents.value[headDithering] = cameraAttached ? 12 : 8
      pluginComponent.useWorldCalculation.value[headDithering] = ditherCalculationType.localPosition
    }
  }
}

export const AvatarTransparencySystem = defineSystem({
  uuid: 'AvatarTransparencySystem',
  execute,
  insert: { with: PresentationSystemGroup },
  reactor: () => {
    const selfEid = AvatarComponent.useSelfAvatarEntity()

    const avatarQuery = useQuery([AvatarComponent])

    return (
      <>
        {avatarQuery.map((childEntity) => (
          <AvatarReactor key={childEntity} entity={childEntity} />
        ))}
      </>
    )
  }
})

const AvatarReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const sceneInstanceID = GLTFComponent.useInstanceID(entity)
  const childEntities = useHookstate(SourceComponent.entitiesBySourceState[sceneInstanceID])
  return (
    <>
      {childEntities.value?.map((childEntity) => (
        <DitherChildReactor key={childEntity} entity={childEntity} rootEntity={entity} />
      ))}
    </>
  )
}

const DitherChildReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const entity = props.entity
  const materialComponentUUID = useOptionalComponent(entity, MaterialInstanceComponent)?.uuid
  useEffect(() => {
    if (!materialComponentUUID?.value) return
    for (const materialUUID of materialComponentUUID.value) {
      const material = UUIDComponent.getEntityByUUID(materialUUID)
      const rootDitheringComponent = getMutableComponent(props.rootEntity, TransparencyDitheringRootComponent)
      if (!rootDitheringComponent.materials.value.includes(materialUUID))
        rootDitheringComponent.materials.set([...rootDitheringComponent.materials.value, materialUUID])
      setComponent(material, TransparencyDitheringPluginComponent)
    }
  }, [materialComponentUUID])
  return null
}
