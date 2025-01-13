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
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, ShadowMaterial } from 'three'

import { EntityTreeComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../common/NameComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { ReferenceSpace, XRState } from './XRState'

export const placementHelperMaterial = new MeshBasicMaterial({
  color: 'grey',
  wireframe: false,
  opacity: 0.5,
  transparent: true
})
export const shadowMaterial = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a, colorWrite: false })
shadowMaterial.polygonOffset = true
shadowMaterial.polygonOffsetFactor = -0.01

export const XRDetectedPlaneComponentState = defineComponent({
  name: 'XRDetectedPlaneComponentState',
  initial: () => ({
    detectedPlanesMap: new Map<XRPlane, Entity>(),
    planesLastChangedTimes: new Map<XRPlane, number>()
  })
})

export const XRDetectedPlaneComponent = defineComponent({
  name: 'XRDetectedPlaneComponent',

  schema: S.Object({
    plane: S.Type<XRPlane>(),
    // internal
    shadowMesh: S.Type<Mesh>(),
    geometry: S.Type<BufferGeometry>(),
    placementHelper: S.Type<Mesh>()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, XRDetectedPlaneComponent)

    useEffect(() => {
      return () => {
        component.geometry.value?.dispose()
      }
    }, [])

    // useEffect(() => {
    //   const placementHelper = component.placementHelper.get(NO_PROXY) as Mesh
    //   placementHelper.visible = scenePlacementMode.value === 'placing'
    // }, [scenePlacementMode])

    return null
  },

  createGeometryFromPolygon: (plane: XRPlane) => {
    const geometry = new BufferGeometry()
    const polygon = plane.polygon

    const vertices = [] as number[]
    const uvs = [] as number[]

    for (const point of polygon) {
      vertices.push(point.x, point.y, point.z)
      uvs.push(point.x, point.z)
    }

    const indices = [] as number[]
    for (let i = 2; i < polygon.length; ++i) {
      indices.push(0, i - 1, i)
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
  },

  updatePlaneGeometry: (entity: Entity) => {
    const state = getState(XRDetectedPlaneComponentState)
    const plane = getComponent(entity, XRDetectedPlaneComponent).plane
    const lastKnownTime = state.planesLastChangedTimes.get(plane)!
    if (plane.lastChangedTime > lastKnownTime) {
      state.planesLastChangedTimes.set(plane, plane.lastChangedTime)
      const geometry = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      const planeComponent = getMutableComponent(entity, XRDetectedPlaneComponent)
      planeComponent.geometry.value?.dispose()
      planeComponent.shadowMesh.value?.geometry.dispose()
      const mesh = new Mesh(geometry, shadowMaterial)
      setComponent(entity, MeshComponent, mesh)
      planeComponent.geometry.set(geometry)
      planeComponent.shadowMesh.set(mesh)
    }
  },

  updatePlanePose: (entity: Entity) => {
    const plane = getComponent(entity, XRDetectedPlaneComponent).plane
    const planePose = getState(XRState).xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
    if (!planePose) return
    TransformComponent.position.x[entity] = planePose.transform.position.x
    TransformComponent.position.y[entity] = planePose.transform.position.y
    TransformComponent.position.z[entity] = planePose.transform.position.z
    TransformComponent.rotation.x[entity] = planePose.transform.orientation.x
    TransformComponent.rotation.y[entity] = planePose.transform.orientation.y
    TransformComponent.rotation.z[entity] = planePose.transform.orientation.z
    TransformComponent.rotation.w[entity] = planePose.transform.orientation.w
  },

  getPlaneEntity: (plane: XRPlane) => {
    const state = getState(XRDetectedPlaneComponentState)
    if (state.detectedPlanesMap.has(plane)) {
      return state.detectedPlanesMap.get(plane)!
    }
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
    setComponent(entity, TransformComponent)
    setVisibleComponent(entity, true)
    setComponent(entity, XRDetectedPlaneComponent, { plane })
    setComponent(entity, NameComponent, 'xrplane-' + planeId++ + '-' + plane.semanticLabel)
    state.planesLastChangedTimes.set(plane, -1)
    state.detectedPlanesMap.set(plane, entity)
    return entity
  },

  purgeExpiredPlanes: (detectedPlanes: XRPlaneSet) => {
    const state = getState(XRDetectedPlaneComponentState)
    for (const [plane, entity] of state.detectedPlanesMap) {
      if (detectedPlanes.has(plane)) continue
      state.detectedPlanesMap.delete(plane)
      state.planesLastChangedTimes.delete(plane)
      removeEntity(entity)
    }
  },

  updateDetectedPlanes: (detectedPlanes: XRPlaneSet) => {
    XRDetectedPlaneComponent.purgeExpiredPlanes(detectedPlanes)
    for (const plane of detectedPlanes) {
      const entity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      XRDetectedPlaneComponent.updatePlaneGeometry(entity)
      XRDetectedPlaneComponent.updatePlanePose(entity)
    }
  }
})

let planeId = 0
