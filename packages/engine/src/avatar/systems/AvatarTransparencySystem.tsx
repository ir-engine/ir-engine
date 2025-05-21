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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  AnimationSystemGroup,
  Entity,
  EntityArrayBoundary,
  QueryReactor,
  UUIDComponent,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React, { useEffect } from 'react'
import {
  DitherCalculationType,
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent
} from '../../material/plugins/TransparencyDitheringComponent'
import { AvatarComponent } from '../components/AvatarComponent'

const headDithering = 0
const cameraDithering = 1
const avatarQuery = defineQuery([AvatarComponent])

const execute = () => {
  const selfEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfEntity) return

  const cameraAttached = XRState.isCameraAttachedToAvatar

  for (const avatarEntity of avatarQuery()) {
    const transparencyDitheringRoot = getOptionalComponent(avatarEntity, TransparencyDitheringRootComponent)
    const materials = transparencyDitheringRoot?.materials
    if (!materials) setComponent(avatarEntity, TransparencyDitheringRootComponent, { materials: [] })

    const avatarComponent = getComponent(avatarEntity, AvatarComponent)
    const cameraComponent = getOptionalComponent(getState(ReferenceSpaceState).viewerEntity, FollowCameraComponent)

    if (!materials?.length) continue
    for (const materialEntity of materials) {
      const pluginComponent = getOptionalComponent(materialEntity, TransparencyDitheringPluginComponent)
      if (!pluginComponent) continue
      const viewerPosition = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent).position
      pluginComponent.centers[cameraDithering].set(viewerPosition.x, viewerPosition.y, viewerPosition.z)
      pluginComponent.distances[cameraDithering] = cameraAttached ? 8 : 3
      pluginComponent.exponents[cameraDithering] = cameraAttached ? 10 : 6
      pluginComponent.useWorldCalculation[cameraDithering] = DitherCalculationType.worldTransformed
      if (avatarEntity !== selfEntity) {
        pluginComponent.distances[headDithering] = 10
        continue
      }
      pluginComponent.centers[headDithering].setY(avatarComponent.eyeHeight)
      pluginComponent.distances[headDithering] =
        cameraComponent && !cameraAttached ? Math.max(Math.pow(cameraComponent.distance * 5, 2.5), 3) : 3.5
      pluginComponent.exponents[headDithering] = cameraAttached ? 12 : 8
      pluginComponent.useWorldCalculation[headDithering] = DitherCalculationType.localPosition
    }
  }
}

export const AvatarTransparencySystem = defineSystem({
  uuid: 'AvatarTransparencySystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor: () => <QueryReactor Components={[AvatarComponent]} ChildEntityReactor={AvatarReactor} />
})

const AvatarReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const sourceID = UUIDComponent.getAsSourceID(entity)
  const childEntities = UUIDComponent.useEntitiesBySource(sourceID)

  return (
    <EntityArrayBoundary
      entities={childEntities}
      ChildEntityReactor={DitherChildReactor}
      props={{ rootEntity: entity }}
    />
  )
}

const DitherChildReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const entity = props.entity
  const materialComponentEntities = useOptionalComponent(entity, MaterialInstanceComponent)?.entities
  const rootDitheringComponent = useOptionalComponent(props.rootEntity, TransparencyDitheringRootComponent)

  useEffect(() => {
    if (!materialComponentEntities?.length || !rootDitheringComponent) return
    for (const entity of materialComponentEntities.value) {
      if (!entity) continue
      if (!rootDitheringComponent.materials.value.includes(entity))
        rootDitheringComponent.materials.set([...rootDitheringComponent.materials.value, entity])
      setComponent(entity, TransparencyDitheringPluginComponent)
    }
  }, [materialComponentEntities, !!rootDitheringComponent])

  return null
}
