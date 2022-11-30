import { BoxGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, ShadowMaterial } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { LocalTransformComponent, setLocalTransformComponent } from '../transform/components/TransformComponent'
import { XRPlaneComponent } from './XRComponents'
import { XRAction } from './XRState'

type DetectedPlanesType = {
  /** WebXR implements detectedPlanes on the XRFrame, but the current typescript implementation has it on worldInformation */
  detectedPlanes: XRPlaneSet
  lastChangedTime: number
}

export const foundPlane = (frame: XRFrame & DetectedPlanesType, world: World, plane: XRPlane) => {
  const referenceSpace = EngineRenderer.instance.xrManager.getReferenceSpace()
  if (!referenceSpace) return

  const planePose = frame.getPose(plane.planeSpace, referenceSpace)
  if (!planePose) return

  const polygon = plane.polygon

  let minX = Number.MAX_SAFE_INTEGER
  let maxX = Number.MIN_SAFE_INTEGER
  let minZ = Number.MAX_SAFE_INTEGER
  let maxZ = Number.MIN_SAFE_INTEGER

  for (const point of polygon) {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minZ = Math.min(minZ, point.z)
    maxZ = Math.max(maxZ, point.z)
  }

  const width = maxX - minX
  const height = maxZ - minZ

  const entity = createEntity()
  setLocalTransformComponent(entity, world.originEntity)
  setVisibleComponent(entity, true)
  setComponent(entity, XRPlaneComponent)

  const box = new BoxGeometry(width, 0.01, height)

  const transform = getComponent(entity, LocalTransformComponent)
  transform.matrix.fromArray(planePose.transform.matrix)
  transform.matrix.decompose(transform.position, transform.rotation, transform.scale)

  const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
  const shadowMesh = new Mesh(box, shadowMat)

  const occlusionMat = new MeshBasicMaterial({ colorWrite: false })
  const occlusionMesh = new Mesh(box, occlusionMat)
  occlusionMesh.renderOrder = -1 /** @todo make a global config for AR occlusion mesh renderOrder */

  // debug
  // occlusionMesh.add(new Mesh(box, new MeshLambertMaterial({ wireframe: true })))

  addObjectToGroup(entity, shadowMesh)
  addObjectToGroup(entity, occlusionMesh)

  return entity
}

export const lostPlane = (plane: XRPlane, entity: Entity) => {
  removeEntity(entity)
}

export const detectedPlanesMap = new Map<XRPlane, Entity>()

export default async function XRDetectedPlanesSystem(world: World) {
  const planesLastChangedTimes = new Map()

  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

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
    const frame = Engine.instance.xrFrame as XRFrame & DetectedPlanesType
    if (!frame?.detectedPlanes) return

    for (const [plane, entity] of detectedPlanesMap) {
      if (!frame.detectedPlanes.has(plane)) {
        lostPlane(plane, entity)
        detectedPlanesMap.delete(plane)
        planesLastChangedTimes.delete(plane)
      }
    }

    for (const plane of frame.detectedPlanes) {
      if (!detectedPlanesMap.has(plane)) {
        const entity = foundPlane(frame, world, plane)
        if (entity) {
          detectedPlanesMap.set(plane, entity)
          planesLastChangedTimes.set(plane, frame.lastChangedTime)
        }
      } else {
        const lastKnownTime = planesLastChangedTimes.get(plane)
        if (plane.lastChangedTime > lastKnownTime) {
          planesLastChangedTimes.set(plane, plane.lastChangedTime)
        }
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
