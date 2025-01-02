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

import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Mesh } from 'three'

import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { EngineState } from '../EngineState'
import { NameComponent } from '../common/NameComponent'
import { addObjectToGroup, removeObjectFromGroup } from '../renderer/components/ObjectComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { shadowMaterial } from './XRDetectedPlaneComponent'
import { ReferenceSpace, XRState } from './XRState'

export const XRDetectedMeshComponent = defineComponent({
  name: 'XRDetectedMeshComponent',

  schema: S.Object({
    mesh: S.Type<XRMesh>(),
    // internal
    shadowMesh: S.Type<Mesh>(),
    geometry: S.Type<BufferGeometry>(),
    placementHelper: S.Type<Mesh>()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, XRDetectedMeshComponent)
    const scenePlacementMode = useHookstate(getMutableState(XRState).scenePlacementMode)

    useEffect(() => {
      if (!component.mesh.value) return

      const geometry = XRDetectedMeshComponent.createGeometryFromMesh(component.mesh.value)
      component.geometry.set(geometry)

      const shadowMesh = new Mesh(geometry, shadowMaterial)
      // const placementHelper = new Mesh(geometry, placementHelperMaterial)

      addObjectToGroup(entity, shadowMesh)
      // addObjectToGroup(entity, placementHelper)

      component.shadowMesh.set(shadowMesh)
      // component.placementHelper.set(placementHelper)

      return () => {
        removeObjectFromGroup(entity, shadowMesh)
        // removeObjectFromGroup(entity, placementHelper)
      }
    }, [component.mesh])

    useEffect(() => {
      const shadowMesh = component.shadowMesh.value
      const geometry = component.geometry.value

      if (shadowMesh.geometry) (shadowMesh.geometry as any) = geometry

      return () => {
        geometry.dispose()
      }
    }, [component.geometry])

    useEffect(() => {
      const placementHelper = component.placementHelper.value as Mesh
      placementHelper.visible = scenePlacementMode.value === 'placing'
    }, [scenePlacementMode])

    return null
  },

  createGeometryFromMesh: (mesh: XRMesh) => {
    const geometry = new BufferGeometry()

    const vertices = mesh.vertices
    const indices = mesh.indices

    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setIndex(new BufferAttribute(indices, 1))
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
  },

  updateMeshGeometry: (entity: Entity, mesh: XRMesh) => {
    XRDetectedMeshComponent.meshesLastChangedTimes.set(mesh, mesh.lastChangedTime)
    const geometry = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
  },

  updateMeshPose: (entity: Entity, mesh: XRMesh) => {
    const planePose = getState(XRState).xrFrame!.getPose(mesh.meshSpace, ReferenceSpace.localFloor!)!
    if (!planePose) return
    TransformComponent.position.x[entity] = planePose.transform.position.x
    TransformComponent.position.y[entity] = planePose.transform.position.y
    TransformComponent.position.z[entity] = planePose.transform.position.z
    TransformComponent.rotation.x[entity] = planePose.transform.orientation.x
    TransformComponent.rotation.y[entity] = planePose.transform.orientation.y
    TransformComponent.rotation.z[entity] = planePose.transform.orientation.z
    TransformComponent.rotation.w[entity] = planePose.transform.orientation.w
  },

  foundMesh: (mesh: XRMesh) => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(EngineState).localFloorEntity })
    setComponent(entity, TransformComponent)
    setVisibleComponent(entity, true)
    setComponent(entity, XRDetectedMeshComponent)
    setComponent(entity, NameComponent, 'mesh-' + planeId++)

    XRDetectedMeshComponent.meshesLastChangedTimes.set(mesh, mesh.lastChangedTime)
    XRDetectedMeshComponent.updateMeshPose(entity, mesh)

    setComponent(entity, XRDetectedMeshComponent, { mesh: mesh })

    XRDetectedMeshComponent.detectedMeshesMap.set(mesh, entity)
  },
  detectedMeshesMap: new Map<XRMesh, Entity>(),
  meshesLastChangedTimes: new Map<XRMesh, number>()
})

let planeId = 0
