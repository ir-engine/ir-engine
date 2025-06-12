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
  createEntity,
  EntityTreeComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { useEffect } from 'react'
import { Box3, Box3Helper, Mesh, MeshPhysicalMaterial, SphereGeometry } from 'three'

const sphereGeometry = new SphereGeometry(0.75)
const helperMeshMaterial = new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })

export const EnvmapBakeHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const debugEnabled = selected || hovered
  useHelperEntity(parentEntity, () => new Mesh(sphereGeometry, helperMeshMaterial), debugEnabled)

  const bakeComponent = useComponent(parentEntity, EnvMapBakeComponent)
  const transformComponent = useOptionalComponent(parentEntity, TransformComponent)

  // Box projection visual helper
  useEffect(() => {
    if (!debugEnabled || !bakeComponent.boxProjection.value || !transformComponent) return

    const boxProjectionHelper = new Box3Helper(new Box3(), 'cyan')
    const boundsHelperEntity = createEntity()
    setComponent(boundsHelperEntity, ObjectComponent, boxProjectionHelper)
    setComponent(boundsHelperEntity, TransformComponent)
    setComponent(boundsHelperEntity, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(boundsHelperEntity, VisibleComponent)
    ObjectLayerMaskComponent.setLayer(boundsHelperEntity, ObjectLayers.NodeHelper)

    const helperTransform = getComponent(boundsHelperEntity, TransformComponent)
    helperTransform.position.copy(bakeComponent.bakePositionOffset.value)
    boxProjectionHelper.box.setFromCenterAndSize(bakeComponent.bakePositionOffset.value, bakeComponent.bakeScale.value)
    boxProjectionHelper.updateMatrixWorld(true)

    return () => {
      removeEntity(boundsHelperEntity)
    }
  }, [
    debugEnabled,
    bakeComponent.boxProjection.value,
    bakeComponent.bakePositionOffset.value,
    bakeComponent.bakeScale.value,
    transformComponent?.position.value
  ])
  return null
}
