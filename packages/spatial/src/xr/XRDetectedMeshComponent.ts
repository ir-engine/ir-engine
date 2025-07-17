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

import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Mesh } from 'three'

import {
  Entity,
  EntityTreeComponent,
  S,
  createEntity,
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { defineState, getState } from '@ir-engine/hyperflux'

import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { NameComponent } from '../common/NameComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { shadowMaterial } from './XRDetectedPlaneComponent'
import { ReferenceSpace, XRState } from './XRState'

export const XRDetectedMeshComponentState = defineState({
  name: 'XRDetectedMeshComponentState',
  initial: () => ({
    detectedMeshesMap: new Map<XRMesh, Entity>(),
    meshesLastChangedTimes: new Map<XRMesh, number>()
  })
})

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
    // const scenePlacementMode = useHookstate(getMutableState(XRState).scenePlacementMode)

    useEffect(() => {
      if (!component.mesh) return

      const geometry = XRDetectedMeshComponent.createGeometryFromMesh(component.mesh)
      component.geometry = geometry

      const shadowMesh = new Mesh(geometry, shadowMaterial)
      // const placementHelper = new Mesh(geometry, placementHelperMaterial)

      setComponent(entity, MeshComponent, shadowMesh)
      // addObjectToGroup(entity, placementHelper)

      component.shadowMesh = shadowMesh
      // component.placementHelper.set(placementHelper)

      return () => {
        removeComponent(entity, MeshComponent)
        // removeObjectFromGroup(entity, placementHelper)
      }
    }, [component.mesh])

    useEffect(() => {
      const shadowMesh = component.shadowMesh
      const geometry = component.geometry

      shadowMesh.geometry = geometry

      return () => {
        geometry.dispose()
      }
    }, [component.geometry])

    /** @warning Currently broken. Makes the other hooks behave unexpectedly */
    // useEffect(() => {
    //   const placementHelper = component.placementHelper.value as Mesh
    //   placementHelper.visible = scenePlacementMode.value === 'placing'
    // }, [scenePlacementMode])

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

  updateMeshGeometry: (entity: Entity) => {
    const state = getState(XRDetectedMeshComponentState)
    const mesh = getComponent(entity, XRDetectedMeshComponent).mesh
    const lastKnownTime = state.meshesLastChangedTimes.get(mesh)!
    if (mesh.lastChangedTime > lastKnownTime) {
      state.meshesLastChangedTimes.set(mesh, mesh.lastChangedTime)
      const geometry = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      const meshComponent = getMutableComponent(entity, XRDetectedMeshComponent)
      meshComponent.geometry?.dispose()
      meshComponent.shadowMesh?.geometry.dispose()
      const meshObj = new Mesh(geometry, shadowMaterial)
      setComponent(entity, MeshComponent, meshObj)
      meshComponent.geometry = geometry
      meshComponent.shadowMesh = meshObj
    }
  },

  updateMeshPose: (entity: Entity) => {
    const mesh = getComponent(entity, XRDetectedMeshComponent).mesh
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

  getMeshEntity: (mesh: XRMesh) => {
    const state = getState(XRDetectedMeshComponentState)
    if (state.detectedMeshesMap.has(mesh)) return state.detectedMeshesMap.get(mesh)!
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(ReferenceSpaceState).localFloorEntity })
    setComponent(entity, TransformComponent)
    setVisibleComponent(entity, true)
    setComponent(entity, XRDetectedMeshComponent)
    setComponent(entity, NameComponent, 'xrmesh-' + planeId++ + '-' + mesh.semanticLabel)
    setComponent(entity, XRDetectedMeshComponent, { mesh: mesh })
    state.meshesLastChangedTimes.set(mesh, -1)
    state.detectedMeshesMap.set(mesh, entity)
    return entity
  },

  removeMeshEntity: (mesh: XRMesh) => {
    const state = getState(XRDetectedMeshComponentState)
    const entity = state.detectedMeshesMap.get(mesh)
    if (!entity) return
    removeEntity(entity)
    state.detectedMeshesMap.delete(mesh)
    state.meshesLastChangedTimes.delete(mesh)
  },

  purgeExpiredMeshes: (detectedMeshes: XRMeshSet) => {
    const state = getState(XRDetectedMeshComponentState)
    for (const [mesh, entity] of state.detectedMeshesMap) {
      if (detectedMeshes.has(mesh)) continue
      state.detectedMeshesMap.delete(mesh)
      state.meshesLastChangedTimes.delete(mesh)
      removeEntity(entity)
    }
  },

  updateDetectedMeshes: (detectedMeshes: XRMeshSet) => {
    XRDetectedMeshComponent.purgeExpiredMeshes(detectedMeshes)
    for (const mesh of detectedMeshes) {
      const entity = XRDetectedMeshComponent.getMeshEntity(mesh)
      XRDetectedMeshComponent.updateMeshGeometry(entity)
      XRDetectedMeshComponent.updateMeshPose(entity)
    }
  }
})

let planeId = 0
