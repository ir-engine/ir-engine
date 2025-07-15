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
  defineSystem,
  Entity,
  getComponent,
  Layers,
  Not,
  QueryReactor,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import {
  OrientedBoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/engine/src/scene/components/OrientedBoundingBoxComponent'
import { TransformSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import React, { useEffect } from 'react'
import { Box3, BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'
// Alternative for thicker lines (uncomment if needed):
// import { Line2 } from 'three/examples/jsm/lines/Line2.js'
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
// import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { useHookstate } from '@hookstate/core'
import { SelectTagComponent } from '@ir-engine/engine/src/scene/components/SelectTagComponent'
import { createSceneEntity } from '@ir-engine/engine/src/scene/functions/createSceneEntity'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'

// Create a wireframe box geometry that matches the given Box3
function createWireframeBoxGeometry(box: Box3): BufferGeometry {
  const geometry = new BufferGeometry()

  // Get the 8 corners of the box
  const min = box.min
  const max = box.max

  // Define the 8 vertices of the box
  const vertices = new Float32Array([
    // Bottom face vertices
    min.x,
    min.y,
    min.z, // 0
    max.x,
    min.y,
    min.z, // 1
    max.x,
    min.y,
    max.z, // 2
    min.x,
    min.y,
    max.z, // 3
    // Top face vertices
    min.x,
    max.y,
    min.z, // 4
    max.x,
    max.y,
    min.z, // 5
    max.x,
    max.y,
    max.z, // 6
    min.x,
    max.y,
    max.z // 7
  ])

  // Define the 12 edges of the box (24 indices for 12 line segments)
  const indices = [
    // Bottom face edges
    0, 1, 1, 2, 2, 3, 3, 0,
    // Top face edges
    4, 5, 5, 6, 6, 7, 7, 4,
    // Vertical edges
    0, 4, 1, 5, 2, 6, 3, 7
  ]

  geometry.setAttribute('position', new BufferAttribute(vertices, 3))
  geometry.setIndex(indices)

  return geometry
}

export const OrientedBoundingBoxSystem = defineSystem({
  uuid: 'napster.engine.OrientedBoundingBoxSystem',
  insert: { after: TransformSystem },
  reactor: () => {
    return (
      <QueryReactor
        layer={Layers.Authoring}
        Components={[GLTFComponent, Not(SceneComponent)]}
        ChildEntityReactor={OrientedBoundingBoxReactor}
      />
    )
  }
})

const OrientedBoundingBoxReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const gltf = useComponent(entity, GLTFComponent)
  const selected = useHasComponent(entity, SelectTagComponent)
  const loaded = GLTFComponent.useSceneLoaded(entity)
  const helperEntityState = useHookstate(UndefinedEntity)

  useEffect(() => {
    if (!loaded) return
    if (gltf.src.value) {
      setComponent(entity, OrientedBoundingBoxComponent)
      updateBoundingBox(entity)
      const helperEntity = createSceneEntity('OrientedBoundingBoxHelper', entity)
      const orientedBoundingBox = getComponent(entity, OrientedBoundingBoxComponent)

      // Create custom wireframe geometry that matches the bounding box
      const wireframeGeometry = createWireframeBoxGeometry(orientedBoundingBox.box)
      const wireframeMaterial = new LineBasicMaterial({ color: 'red', opacity: 0.5, transparent: true, linewidth: 3 })
      const wireframeHelper = new LineSegments(wireframeGeometry, wireframeMaterial)
      ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.NodeHelper)

      setComponent(helperEntity, ObjectComponent, wireframeHelper)
      helperEntityState.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        helperEntityState.set(UndefinedEntity)
      }
    }
  }, [gltf.src, loaded])

  useEffect(() => {
    if (helperEntityState.value === UndefinedEntity) return
    const helperEntity = helperEntityState.value
    const helperObject = getComponent(helperEntity, ObjectComponent) as any as LineSegments
    const material = helperObject.material as LineBasicMaterial
    material.color.set(selected ? 'green' : 'red')
  }, [helperEntityState, selected])

  return null
}
