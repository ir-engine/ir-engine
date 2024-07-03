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
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, MeshBasicMaterial, Vector3 } from 'three'

import {
  createEntity,
  defineComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { useResource } from '@etherealengine/spatial/src/resources/resourceHooks'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { SplineComponent } from '../SplineComponent'

const ARC_SEGMENTS = 200
const _point = new Vector3()

const lineMaterial = new LineBasicMaterial({ color: 'white', opacity: 0.35 })
const createLineGeom = () => {
  const lineGeometry = new BufferGeometry()
  lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))
  return lineGeometry
}
const greenMeshMaterial = () => new MeshBasicMaterial({ color: 'lightgreen', opacity: 0.2 })
const redMeshMaterial = () => new MeshBasicMaterial({ color: 'red', opacity: 0.2 })

export const SplineHelperComponent = defineComponent({
  name: 'SplineHelperComponent',

  onInit: (entity) => ({
    layerMask: ObjectLayerMasks.NodeHelper
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.layerMask === 'number') component.layerMask.set(json.layerMask)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineHelperComponent)
    const spline = useComponent(entity, SplineComponent)

    const [lineGeometry] = useResource(createLineGeom, entity)
    /** @todo these are probably unnecessary and were just used for debugging the implementation */
    // const [sphereGeometry] = useResource(() => new SphereGeometry(0.05, 4, 2), entity)

    // const [greenMat] = useResource(greenMeshMaterial, entity)
    // const [greenSphere] = useDisposable(
    //   Mesh,
    //   entity,
    //   sphereGeometry.value as SphereGeometry,
    //   greenMat.value as MeshBasicMaterial
    // )

    // const [redMat] = useResource(redMeshMaterial, entity)
    // const [redSphere] = useDisposable(
    //   Mesh,
    //   entity,
    //   sphereGeometry.value as SphereGeometry,
    //   redMat.value as MeshBasicMaterial
    // )

    useEffect(() => {
      // const gizmoEntities = [] as Entity[]
      const curve = spline.curve.value
      const elements = spline.elements
      if (elements.length < 3) return
      const lineEntity = createEntity()

      // Geometry and material are created in module scope and reused, do not dispose
      const line = new Line(lineGeometry.value as BufferGeometry, lineMaterial)
      line.name = `SplineHelperComponent-${entity}`

      addObjectToGroup(lineEntity, line)
      setComponent(lineEntity, NameComponent, line.name)
      setComponent(lineEntity, EntityTreeComponent, { parentEntity: entity })

      setVisibleComponent(lineEntity, true)

      // if (elements.length > 0) {
      //   const first = elements[0].value
      //   greenSphere.position.copy(first.position)
      //   addObjectToGroup(lineEntity, greenSphere)
      // }

      // if (elements.length > 1) {
      //   const last = elements[elements.length - 1].value
      //   redSphere.position.copy(last.position)
      //   addObjectToGroup(lineEntity, redSphere)
      // }

      // let id = 0
      // for (const elem of elements.value) {
      //   const gizmoEntity = createEntity()
      //   gizmoEntities.push(gizmoEntity)
      //   setComponent(gizmoEntity, EntityTreeComponent, { parentEntity: lineEntity })
      //   setComponent(gizmoEntity, TransformComponent, {
      //     position: elem.position,
      //     rotation: elem.quaternion
      //   })
      //   setComponent(gizmoEntity, AxesHelperComponent, { name: `spline-gizmo-${++id}` })
      // }

      // setComponent(lineEntity, ObjectLayerMaskComponent, component.layerMask.value)

      const positions = line.geometry.attributes.position
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1)
        curve.getPoint(t, _point)
        positions.setXYZ(i, _point.x, _point.y, _point.z)
      }
      positions.needsUpdate = true

      return () => {
        if (lineEntity) removeEntity(lineEntity)
        // for (const gizmoEntity of gizmoEntities) removeEntity(gizmoEntity)
      }
    }, [spline.curve, component.layerMask])

    return null
  }
})
