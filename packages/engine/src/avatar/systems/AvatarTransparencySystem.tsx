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
} from '@etherealengine/ecs'
import { getState, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'

import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { MaterialInstanceComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import {
  TransparencyDitheringPlugin,
  TransparencyDitheringRoot,
  ditherCalculationType
} from '@etherealengine/spatial/src/renderer/materials/constants/plugins/TransparencyDitheringComponent'
import React, { useEffect } from 'react'
import { SourceComponent } from '../../scene/components/SourceComponent'
import { useModelSceneID } from '../../scene/functions/loaders/ModelFunctions'
import { AvatarComponent } from '../components/AvatarComponent'

const headDithering = 0
const cameraDithering = 1
const avatarQuery = defineQuery([AvatarComponent])
const execute = () => {
  const selfEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfEntity) return
  const cameraAttached = XRState.isCameraAttachedToAvatar

  for (const entity of avatarQuery()) {
    const materials = getComponent(entity, TransparencyDitheringRoot)?.materials
    if (!materials) setComponent(entity, TransparencyDitheringRoot, { materials: [] })

    const avatarComponent = getComponent(entity, AvatarComponent)
    const cameraComponent = getOptionalComponent(getState(EngineState).viewerEntity, FollowCameraComponent)

    if (!materials?.length) return
    for (const materialUUID of materials) {
      const pluginComponent = getOptionalComponent(
        UUIDComponent.getEntityByUUID(materialUUID),
        TransparencyDitheringPlugin
      )
      if (!pluginComponent) continue
      const viewerPosition = getComponent(Engine.instance.viewerEntity, TransformComponent).position
      pluginComponent.centers.value[cameraDithering].set(viewerPosition.x, viewerPosition.y, viewerPosition.z)
      pluginComponent.distances.value[cameraDithering] = cameraAttached ? 8 : 3
      pluginComponent.exponents.value[cameraDithering] = cameraAttached ? 10 : 2
      pluginComponent.useWorldCalculation.value[cameraDithering] = ditherCalculationType.worldTransformed
      if (entity !== selfEntity) continue
      pluginComponent.centers.value[headDithering].setY(avatarComponent.eyeHeight)
      pluginComponent.distances.value[headDithering] =
        cameraComponent && !cameraAttached ? Math.max(Math.pow(cameraComponent.distance * 5, 2.5), 3) : 3.25
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
  const sceneInstanceID = useModelSceneID(entity)
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
      const rootDitheringComponent = getMutableComponent(props.rootEntity, TransparencyDitheringRoot)
      if (!rootDitheringComponent.materials.value.includes(materialUUID))
        rootDitheringComponent.materials.set([...rootDitheringComponent.materials.value, materialUUID])
      setComponent(material, TransparencyDitheringPlugin)
    }
  }, [materialComponentUUID])
  return null
}
