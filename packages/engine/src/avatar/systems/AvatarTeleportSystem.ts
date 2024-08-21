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
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Vector3
} from 'three'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineState, dispatchAction, getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraActions } from '@ir-engine/spatial/src/camera/CameraState'
import checkPositionIsValid from '@ir-engine/spatial/src/common/functions/checkPositionIsValid'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { easeOutCubic, normalizeRange } from '@ir-engine/spatial/src/common/functions/MathFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { ReferenceSpace, XRAction, XRState } from '@ir-engine/spatial/src/xr/XRState'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { AvatarTeleportComponent } from '.././components/AvatarTeleportComponent'
import { teleportAvatar } from '.././functions/moveAvatar'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'

// Guideline parabola function
const positionAtT = (inVec: Vector3, t: number, p: Vector3, v: Vector3, gravity: Vector3): Vector3 => {
  inVec.copy(p)
  inVec.addScaledVector(v, t)
  inVec.addScaledVector(gravity, 0.5 * t ** 2)
  return inVec
}

// Utility Vectors
// Unit: m/s
const initialVelocity = 4
const dynamicVelocity = 6
const gravity = new Vector3(0, -9.8, 0)
const currentVertexLocal = new Vector3()
const currentVertexWorld = new Vector3()
const nextVertexWorld = new Vector3()
const tempVecP = new Vector3()
const tempVecV = new Vector3()

const white = new Color('white')
const red = new Color('red')

/**
 * @param position in world space
 * @param rotation in world space
 * @param initialVelocity
 * @param gravity
 * @returns
 */
const getParabolaInputParams = (
  position: Vector3,
  rotation: Quaternion,
  initialVelocity: number,
  gravity: Vector3
): { p: Vector3; v: Vector3; t: number } => {
  // Controller start position
  const p = tempVecP.copy(position)

  // Set Vector V to the direction of the controller, at 1m/s
  const v = tempVecV.set(0, 0, 1).applyQuaternion(rotation)

  // Scale the initial velocity
  let normalizedYDirection = 1 - normalizeRange(v.y, -1, 1)
  v.multiplyScalar(initialVelocity + dynamicVelocity * normalizedYDirection)

  // Time for tele ball to hit ground
  const t = (-v.y + Math.sqrt(v.y ** 2 - 2 * p.y * gravity.y)) / gravity.y

  return {
    p,
    v,
    t
  }
}

const stopGuidelineAtVertex = (vertex: Vector3, line: Float32Array, startIndex: number, lineSegments: number) => {
  for (let i = startIndex; i <= lineSegments; i++) {
    vertex.toArray(line, i * 3)
  }
}

const AvatarTeleportSystemState = defineState({
  name: 'AvatarTeleportSystemState',
  initial: {} as {
    guideCursor: Mesh<BufferGeometry, MeshBasicMaterial>
    transition: ReturnType<typeof createTransitionState>
    guideline: Line<BufferGeometry, LineBasicMaterial>
    guidelineEntity: Entity
    guideCursorEntity: Entity
    lineMaterial: LineBasicMaterial
  }
})

const lineSegments = 64 // segments to make a whole circle, uses far less
const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3)
const lineGeometryColors = new Float32Array((lineSegments + 1) * 3)
const mat4 = new Matrix4()

let canTeleport = false

const avatarTeleportQuery = defineQuery([AvatarTeleportComponent])
let fadeBackInAccumulator = -1

let visibleSegments = 2

const execute = () => {
  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar
  if (!isCameraAttachedToAvatar) return
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()

  const { guideCursor, transition, guideline, guidelineEntity, guideCursorEntity, lineMaterial } =
    getState(AvatarTeleportSystemState)

  if (!guidelineEntity) return

  if (fadeBackInAccumulator >= 0) {
    fadeBackInAccumulator += getState(ECSState).deltaSeconds
    if (fadeBackInAccumulator > 0.25) {
      fadeBackInAccumulator = -1
      teleportAvatar(selfAvatarEntity, getComponent(guideCursorEntity, TransformComponent).position)
      dispatchAction(CameraActions.fadeToBlack({ in: false }))
      dispatchAction(XRAction.vibrateController({ handedness: 'left', value: 0.5, duration: 100 }))
      dispatchAction(XRAction.vibrateController({ handedness: 'right', value: 0.5, duration: 100 }))
    }
  }
  for (const entity of avatarTeleportQuery.exit()) {
    visibleSegments = 1
    transition.setState('OUT')
    if (canTeleport) {
      fadeBackInAccumulator = 0
      dispatchAction(CameraActions.fadeToBlack({ in: true }))
    }
  }
  for (const entity of avatarTeleportQuery.enter()) {
    setVisibleComponent(guidelineEntity, true)
    transition.setState('IN')
  }
  const guidelineTransform = getComponent(guidelineEntity, TransformComponent)

  const nonCapturedInputSources = InputSourceComponent.nonCapturedInputSources()

  for (const entity of avatarTeleportQuery()) {
    const side = getComponent(selfAvatarEntity, AvatarTeleportComponent).side
    const referenceSpace = ReferenceSpace.origin!

    for (const inputSourceEntity of nonCapturedInputSources) {
      const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
      if (inputSourceComponent.source.handedness === side) {
        const pose = getState(XRState).xrFrame!.getPose(inputSourceComponent.source.targetRaySpace, referenceSpace)!
        guidelineTransform.position.copy(pose.transform.position as any as Vector3)
        guidelineTransform.rotation.copy(pose.transform.orientation as any as Quaternion)
        guidelineTransform.matrix.fromArray(pose.transform.matrix)
      }
    }

    const guidelineTransformMatrixInverse = mat4.copy(guidelineTransform.matrix).invert()

    const { p, v, t } = getParabolaInputParams(
      guidelineTransform.position,
      guidelineTransform.rotation,
      initialVelocity,
      gravity
    )
    lineGeometryVertices.fill(0)
    currentVertexLocal.set(0, 0, 0)
    let lastValidationData: ReturnType<typeof checkPositionIsValid> = null!
    let guidelineBlocked = false
    let i = 0
    if (visibleSegments < lineSegments) visibleSegments += 8
    for (i = 1; i <= visibleSegments && !guidelineBlocked; i++) {
      // set vertex to current position of the virtual ball at time t
      positionAtT(currentVertexWorld, (i * t) / lineSegments, p, v, gravity)
      currentVertexLocal.copy(currentVertexWorld)
      currentVertexLocal.applyMatrix4(guidelineTransformMatrixInverse) // worldToLocal
      currentVertexLocal.toArray(lineGeometryVertices, i * 3)
      positionAtT(nextVertexWorld, ((i + 1) * t) / lineSegments, p, v, gravity)
      const currentVertexDirection = nextVertexWorld.subVectors(nextVertexWorld, currentVertexWorld)
      const physicsWorld = Physics.getWorld(selfAvatarEntity)!
      const validationData = checkPositionIsValid(physicsWorld, currentVertexWorld, false, currentVertexDirection)
      if (validationData.raycastHit !== null) {
        guidelineBlocked = true
        currentVertexWorld.copy(validationData.raycastHit.position as Vector3)
      }
      lastValidationData = validationData
    }
    lastValidationData.positionValid ? (canTeleport = true) : (canTeleport = false)
    // Line should extend only up to last valid vertex
    currentVertexLocal.copy(currentVertexWorld)
    currentVertexLocal.applyMatrix4(guidelineTransformMatrixInverse) // worldToLocal
    currentVertexLocal.toArray(lineGeometryVertices, i * 3)
    stopGuidelineAtVertex(currentVertexLocal, lineGeometryVertices, i + 1, lineSegments)
    guideline.geometry.attributes.position.needsUpdate = true
    if (canTeleport) {
      // Place the cursor near the end of the line
      getComponent(guideCursorEntity, TransformComponent).position.copy(currentVertexWorld)
      guideCursor.visible = true
      lineMaterial.color = white
    } else {
      guideCursor.visible = false
      lineMaterial.color = red
    }
    setVisibleComponent(guideCursorEntity, canTeleport)
  }
  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (alpha) => {
    if (alpha === 0 && transition.state === 'OUT') {
      setVisibleComponent(guidelineEntity, false)
      setVisibleComponent(guideCursorEntity, false)
    }
    const smoothedAlpha = easeOutCubic(alpha)
    guideCursor.material.opacity = smoothedAlpha
    guideCursor.scale.setScalar(smoothedAlpha * 0.2 + 0.8)
  })
}

const reactor = () => {
  const cameraAttachedToAvatar = XRState.useCameraAttachedToAvatar()

  useEffect(() => {
    if (!cameraAttachedToAvatar) return

    const originEntity = getState(EngineState).originEntity

    const lineGeometry = new BufferGeometry()
    lineGeometryVertices.fill(0)
    lineGeometryColors.fill(0.5)
    lineGeometry.setAttribute('position', new BufferAttribute(lineGeometryVertices, 3))
    lineGeometry.setAttribute('color', new BufferAttribute(lineGeometryColors, 3))
    const lineMaterial = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
    const guideline = new Line(lineGeometry, lineMaterial)
    guideline.frustumCulled = false
    guideline.name = 'teleport-guideline'

    const guidelineEntity = createEntity()
    addObjectToGroup(guidelineEntity, guideline)
    setComponent(guidelineEntity, NameComponent, 'Teleport Guideline')
    setComponent(guidelineEntity, EntityTreeComponent, { parentEntity: originEntity })

    // The guide cursor at the end of the line
    const guideCursorGeometry = new RingGeometry(0.45, 0.5, 32)
    guideCursorGeometry.name = 'teleport-guide-cursor'
    guideCursorGeometry.rotateX(-Math.PI / 2)
    guideCursorGeometry.translate(0, 0.01, 0)
    const guideCursorMaterial = new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide, transparent: true })
    const guideCursor = new Mesh(guideCursorGeometry, guideCursorMaterial)
    guideCursor.frustumCulled = false

    const guideCursorEntity = createEntity()
    addObjectToGroup(guideCursorEntity, guideCursor)
    setComponent(guideCursorEntity, NameComponent, 'Teleport Guideline Cursor')
    setComponent(guideCursorEntity, EntityTreeComponent, { parentEntity: originEntity })

    const transition = createTransitionState(0.5)

    getMutableState(AvatarTeleportSystemState).set({
      guideCursor,
      transition,
      guideline,
      guidelineEntity,
      guideCursorEntity,
      lineMaterial
    })

    return () => {
      removeEntity(guidelineEntity)
      removeEntity(guideCursorEntity)
      getMutableState(AvatarTeleportSystemState).set({} as any)
    }
  }, [cameraAttachedToAvatar])
  return null
}

export const AvatarTeleportSystem = defineSystem({
  uuid: 'ee.engine.AvatarTeleportSystem',
  insert: { after: AvatarAnimationSystem },
  execute,
  reactor
})
