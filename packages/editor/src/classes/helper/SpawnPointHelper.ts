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
  entityExists,
  EntityTreeComponent,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { useGLTFComponent } from '@ir-engine/engine/src/assets/functions/useGLTFComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/SpatialModule'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props
  const debugEnabled = selected || hovered

  const debugGLTF = useGLTFComponent(debugEnabled ? GLTF_PATH : '', parentEntity)

  useEffect(() => {
    if (!debugGLTF || !debugEnabled) return

    const boundsHelperEntity = createEntity()
    setComponent(boundsHelperEntity, TransformComponent)
    setComponent(boundsHelperEntity, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(boundsHelperEntity, VisibleComponent)
    const buffer = new BufferGeometry()
    const positions = new Float32Array([-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5])
    const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0])
    buffer.setIndex(new BufferAttribute(indices, 1))
    buffer.setAttribute('position', new BufferAttribute(positions, 3))
    setComponent(
      boundsHelperEntity,
      ObjectComponent,
      new LineSegments(buffer, new LineBasicMaterial({ color: 'white' }))
    )

    setVisibleComponent(debugGLTF, true)
    setComponent(debugGLTF, ComputedTransformComponent, {
      referenceEntities: [parentEntity],
      computeFunction: () => {
        const scale = getComponent(parentEntity, TransformComponent).scale
        getComponent(debugGLTF, TransformComponent).scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z)
      }
    })

    return () => {
      removeEntity(boundsHelperEntity)
      if (entityExists(debugGLTF)) setVisibleComponent(debugGLTF, false)
    }
  }, [debugGLTF, debugEnabled])

  return null
}
