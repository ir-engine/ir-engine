import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Vector3
} from 'three'

import { getState } from '@xrengine/hyperflux'

import checkPositionIsValid from '../common/functions/checkPositionIsValid'
import { easeOutCubic, normalizeRange } from '../common/functions/MathFunctions'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { setNameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from '../xr/XRState'
import { createTransitionState } from '../xrui/functions/createTransitionState'
import { AvatarTeleportComponent } from './components/AvatarTeleportComponent'
import { teleportAvatar } from './functions/moveAvatar'

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
const dynamicVelocity = 10
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

export default async function AvatarTeleportSystem(world: World) {
  const lineSegments = 32 // segments to make a whole circle, uses far less
  const lineGeometry = new BufferGeometry()
  const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3)
  lineGeometryVertices.fill(0)
  const lineGeometryColors = new Float32Array((lineSegments + 1) * 3)
  lineGeometryColors.fill(0.5)
  lineGeometry.setAttribute('position', new BufferAttribute(lineGeometryVertices, 3))
  lineGeometry.setAttribute('color', new BufferAttribute(lineGeometryColors, 3))
  const lineMaterial = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
  const guideline = new Line(lineGeometry, lineMaterial)

  const guidelineEntity = createEntity()
  setTransformComponent(guidelineEntity)
  addObjectToGroup(guidelineEntity, guideline)
  setNameComponent(guidelineEntity, 'Teleport Guideline')
  const guidelineTransform = getComponent(guidelineEntity, TransformComponent)

  // The guide cursor at the end of the line
  const guideCursorGeometry = new RingGeometry(0.45, 0.5, 32)
  guideCursorGeometry.rotateX(-Math.PI / 2)
  guideCursorGeometry.translate(0, 0.01, 0)
  const guideCursorMaterial = new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide, transparent: true })
  const guideCursor = new Mesh(guideCursorGeometry, guideCursorMaterial)
  guideCursor.frustumCulled = false

  const guideCursorEntity = createEntity()
  setTransformComponent(guideCursorEntity)
  addObjectToGroup(guideCursorEntity, guideCursor)
  setNameComponent(guideCursorEntity, 'Teleport Guideline Cursor')

  const transition = createTransitionState(0.5)

  let canTeleport = false

  const xrState = getState(XRState)
  const avatarTeleportQuery = defineQuery([AvatarTeleportComponent])

  const execute = () => {
    for (const entity of avatarTeleportQuery.exit(world)) {
      // Get cursor position and teleport avatar to it
      if (canTeleport) teleportAvatar(entity, guideCursor.position)
      transition.setState('OUT')
    }
    for (const entity of avatarTeleportQuery.enter(world)) {
      setVisibleComponent(guidelineEntity, true)
      transition.setState('IN')
    }
    for (const entity of avatarTeleportQuery(world)) {
      const sourceEntity =
        getComponent(entity, AvatarTeleportComponent).side === 'left'
          ? xrState.leftControllerEntity.value!
          : xrState.rightControllerEntity.value!
      const sourceTransform = getComponent(sourceEntity, TransformComponent)
      guidelineTransform.position.copy(sourceTransform.position)
      guidelineTransform.rotation.copy(sourceTransform.rotation)
      const { p, v, t } = getParabolaInputParams(
        sourceTransform.position,
        sourceTransform.rotation,
        initialVelocity,
        gravity
      )
      lineGeometryVertices.fill(0)
      currentVertexLocal.set(0, 0, 0)
      let lastValidationData: ReturnType<typeof checkPositionIsValid> = null!
      let guidelineBlocked = false
      let i = 0
      for (i = 1; i <= lineSegments && !guidelineBlocked; i++) {
        // set vertex to current position of the virtual ball at time t
        positionAtT(currentVertexWorld, (i * t) / lineSegments, p, v, gravity)
        currentVertexLocal.copy(currentVertexWorld)
        currentVertexLocal.applyMatrix4(sourceTransform.matrixInverse) // worldToLocal
        currentVertexLocal.toArray(lineGeometryVertices, i * 3)
        positionAtT(nextVertexWorld, ((i + 1) * t) / lineSegments, p, v, gravity)
        const currentVertexDirection = nextVertexWorld.subVectors(nextVertexWorld, currentVertexWorld)
        const validationData = checkPositionIsValid(currentVertexWorld, false, currentVertexDirection)
        if (validationData.raycastHit !== null) {
          guidelineBlocked = true
          currentVertexWorld.copy(validationData.raycastHit.position)
        }
        lastValidationData = validationData
      }
      lastValidationData.positionValid ? (canTeleport = true) : (canTeleport = false)
      // Line should extend only up to last valid vertex
      currentVertexLocal.copy(currentVertexWorld)
      currentVertexLocal.applyMatrix4(sourceTransform.matrixInverse) // worldToLocal
      currentVertexLocal.toArray(lineGeometryVertices, i * 3)
      stopGuidelineAtVertex(currentVertexLocal, lineGeometryVertices, i + 1, lineSegments)
      guideline.geometry.attributes.position.needsUpdate = true
      if (canTeleport) {
        // Place the cursor near the end of the line
        guideCursor.position.copy(currentVertexWorld)
        guideCursor.visible = true
        lineMaterial.color = white
      } else {
        guideCursor.visible = false
        lineMaterial.color = red
      }
      setVisibleComponent(guideCursorEntity, canTeleport)
    }
    transition.update(world.deltaSeconds, (alpha) => {
      if (alpha === 0 && transition.state === 'OUT') {
        setVisibleComponent(guidelineEntity, false)
        setVisibleComponent(guideCursorEntity, false)
      }
      const smoothedAlpha = easeOutCubic(alpha)
      guideCursorMaterial.opacity = smoothedAlpha
      guideCursor.scale.setScalar(smoothedAlpha * 0.2 + 0.8)
    })
  }

  const cleanup = async () => {
    removeEntity(guidelineEntity)
    removeEntity(guideCursorEntity)
    removeQuery(world, avatarTeleportQuery)
  }

  return { execute, cleanup }
}
