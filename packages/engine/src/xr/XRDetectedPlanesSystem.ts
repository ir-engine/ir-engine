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
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, ShadowMaterial } from 'three'

import { defineActionQueue, getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { getComponent, getMutableComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { createPriorityQueue } from '../ecs/PriorityQueue'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { LocalTransformComponent, setLocalTransformComponent } from '../transform/components/TransformComponent'
import { XRPlaneComponent } from './XRComponents'
import { ReferenceSpace, XRAction, XRState } from './XRState'

/** https://github.com/immersive-web/webxr-samples/blob/main/proposals/plane-detection.html */

type DetectedPlanesType = {
  /** WebXR implements detectedPlanes on the XRFrame, but the current typescript implementation has it on worldInformation */
  detectedPlanes: XRPlaneSet
}

export const createGeometryFromPolygon = (plane: XRPlane) => {
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
  return geometry
}

let planeId = 0

export const updatePlaneGeometry = (entity: Entity, plane: XRPlane) => {
  planesLastChangedTimes.set(plane, plane.lastChangedTime)
  const geometry = createGeometryFromPolygon(plane)
  getMutableComponent(entity, XRPlaneComponent).geometry.set(geometry)
}

export const updatePlanePose = (entity: Entity, plane: XRPlane) => {
  const xrFrame = getState(XRState).xrFrame
  const planePose = xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
  if (!planePose) return
  LocalTransformComponent.position.x[entity] = planePose.transform.position.x
  LocalTransformComponent.position.y[entity] = planePose.transform.position.y
  LocalTransformComponent.position.z[entity] = planePose.transform.position.z
  LocalTransformComponent.rotation.x[entity] = planePose.transform.orientation.x
  LocalTransformComponent.rotation.y[entity] = planePose.transform.orientation.y
  LocalTransformComponent.rotation.z[entity] = planePose.transform.orientation.z
  LocalTransformComponent.rotation.w[entity] = planePose.transform.orientation.w
}

export const foundPlane = (plane: XRPlane) => {
  const geometry = createGeometryFromPolygon(plane)

  const entity = createEntity()
  setLocalTransformComponent(entity, Engine.instance.originEntity)
  setVisibleComponent(entity, true)
  setComponent(entity, XRPlaneComponent)
  setComponent(entity, NameComponent, 'plane-' + planeId++)

  const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
  shadowMat.polygonOffset = true
  shadowMat.polygonOffsetFactor = -0.01
  const shadowMesh = new Mesh(geometry, shadowMat)

  const occlusionMat = new MeshBasicMaterial({ colorWrite: false })
  occlusionMat.polygonOffset = true
  occlusionMat.polygonOffsetFactor = -0.01
  const occlusionMesh = new Mesh(geometry, occlusionMat)
  occlusionMesh.renderOrder = -1 /** @todo make a global config for AR occlusion mesh renderOrder */

  const placementHelper = new Mesh(
    geometry,
    new MeshBasicMaterial({ color: 'grey', wireframe: false, opacity: 0.5, transparent: true })
  )
  occlusionMesh.add(placementHelper)

  addObjectToGroup(entity, shadowMesh)
  addObjectToGroup(entity, occlusionMesh)

  planesLastChangedTimes.set(plane, plane.lastChangedTime)
  updatePlanePose(entity, plane)

  setComponent(entity, XRPlaneComponent, { shadowMesh, occlusionMesh, placementHelper, geometry, plane })

  detectedPlanesMap.set(plane, entity)
}

export const lostPlane = (plane: XRPlane, entity: Entity) => {
  removeEntity(entity)
}

export const detectedPlanesMap = new Map<XRPlane, Entity>()
export const planesLastChangedTimes = new Map<XRPlane, number>()

const xrSessionChangedQueue = defineActionQueue(XRAction.sessionChanged.matches)

// detected planes should have significantly different poses very infrequently, so we can afford to run this at a low priority
const planesQueue = createPriorityQueue({
  accumulationBudget: 1
})

const execute = () => {
  for (const action of xrSessionChangedQueue()) {
    if (!action.active) {
      for (const [plane, entity] of detectedPlanesMap) {
        lostPlane(plane, entity)
        detectedPlanesMap.delete(plane)
        planesLastChangedTimes.delete(plane)
      }
      return
    }
  }

  const xrFrame = getState(XRState).xrFrame
  const frame = xrFrame as XRFrame & DetectedPlanesType
  if (!frame?.detectedPlanes || frame.session.environmentBlendMode === 'opaque' || !ReferenceSpace.localFloor) return

  for (const [plane, entity] of detectedPlanesMap) {
    if (!frame.detectedPlanes.has(plane)) {
      lostPlane(plane, entity)
      detectedPlanesMap.delete(plane)
      planesLastChangedTimes.delete(plane)
    }
  }

  for (const plane of frame.detectedPlanes) {
    if (!detectedPlanesMap.has(plane)) {
      foundPlane(plane)
    }
    const entity = detectedPlanesMap.get(plane)!
    planesQueue.addPriority(entity, 1)
  }

  planesQueue.update()

  for (const entity of planesQueue.priorityEntities) {
    const plane = getComponent(entity, XRPlaneComponent).plane
    const lastKnownTime = planesLastChangedTimes.get(plane)!
    if (plane.lastChangedTime > lastKnownTime) {
      updatePlaneGeometry(entity, getComponent(entity, XRPlaneComponent).plane)
    }
  }

  for (const entity of planesQueue.priorityEntities) {
    const plane = getComponent(entity, XRPlaneComponent).plane
    updatePlanePose(entity, plane)
  }
}

const reactor = () => {
  useEffect(() => {
    return () => {
      detectedPlanesMap.clear()
      planesLastChangedTimes.clear()
      planesQueue.reset()
    }
  }, [])
  return null
}

export const XRDetectedPlanesSystem = defineSystem({
  uuid: 'ee.engine.XRDetectedPlanesSystem',
  execute,
  reactor
})
