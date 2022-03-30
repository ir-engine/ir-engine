import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  TorusGeometry,
  Vector3
} from 'three'

import { normalizeRange } from '@xrengine/common/src/utils/mathUtils'

import checkPositionIsValid from '../common/functions/checkPositionIsValid'
import { World } from '../ecs/classes/World'
import { addComponent, defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { AvatarTeleportTagComponent } from './components/AvatarTeleportTagComponent'
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
const initialVelocity = 6
const dynamicVelocity = 10
const gravity = new Vector3(0, -9.8, 0)
const currentVertexLocal = new Vector3()
const currentVertexWorld = new Vector3()
const nextVertexWorld = new Vector3()
const tempVecP = new Vector3()
const tempVecV = new Vector3()

const getParabolaInputParams = (
  controller: Group,
  initialVelocity: number,
  gravity: Vector3
): { p: Vector3; v: Vector3; t: number } => {
  // Controller start position
  const p = controller.getWorldPosition(tempVecP)

  // Set Vector V to the direction of the controller, at 1m/s
  const v = controller.getWorldDirection(tempVecV)

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

export default async function AvatarTeleportSystem(world: World) {
  // The guideline
  const lineSegments = 10
  const lineGeometry = new BufferGeometry()
  const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3)
  lineGeometryVertices.fill(0)
  const lineGeometryColors = new Float32Array((lineSegments + 1) * 3)
  lineGeometryColors.fill(0.5)
  lineGeometry.setAttribute('position', new BufferAttribute(lineGeometryVertices, 3))
  lineGeometry.setAttribute('color', new BufferAttribute(lineGeometryColors, 3))
  const lineMaterial = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
  const guideline = new Line(lineGeometry, lineMaterial)

  // The guide cursor at the end of the line
  const guideCursorGeometry = new TorusGeometry(1, 0.1, 10, 20)
  const guideCursorMaterial = new MeshBasicMaterial({ color: 0xffff00 })
  const guideCursorTorusMesh = new Mesh(guideCursorGeometry, guideCursorMaterial)
  const guideCursor = new Object3D()
  guideCursor.add(guideCursorTorusMesh)
  guideCursor.scale.set(0.2, 0.2, 0.2)
  guideCursor.lookAt(0, 1, 0)
  guideCursor.visible = false

  const guideCursorEntity = createEntity()
  addComponent(guideCursorEntity, Object3DComponent, { value: guideCursor })

  let guidingController = new Group()
  let canTeleport = false

  const avatarTeleportQuery = defineQuery([AvatarTeleportTagComponent])
  return () => {
    for (const entity of avatarTeleportQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const controller = xrInputSourceComponent.controllerRight
      guidingController = controller
      guidingController.add(guideline)
    }

    for (const entity of avatarTeleportQuery(world)) {
      if (guidingController) {
        const { p, v, t } = getParabolaInputParams(guidingController, initialVelocity, gravity)

        lineGeometryVertices.fill(0)
        currentVertexLocal.set(0, 0, 0)
        let lastValidationData
        let guidelineBlocked = false
        for (let i = 1; i <= lineSegments && !guidelineBlocked; i++) {
          // set vertex to current position of the virtual ball at time t
          positionAtT(currentVertexWorld, (i * t) / lineSegments, p, v, gravity)
          currentVertexLocal.copy(currentVertexWorld)
          guidingController.worldToLocal(currentVertexLocal)
          currentVertexLocal.toArray(lineGeometryVertices, i * 3)

          positionAtT(nextVertexWorld, ((i + 1) * t) / lineSegments, p, v, gravity)
          console.log(currentVertexWorld, nextVertexWorld)
          const direction = nextVertexWorld.subVectors(nextVertexWorld, currentVertexWorld)

          const validationData = checkPositionIsValid(currentVertexWorld, false, direction)
          if (!validationData.positionValid && validationData.raycastHit !== null) {
            guidelineBlocked = true
          }

          lastValidationData = validationData
        }
        !guidelineBlocked && lastValidationData.positionValid ? (canTeleport = true) : (canTeleport = false)

        guideline.geometry.attributes.position.needsUpdate = true

        if (canTeleport) {
          // Place the cursor near the end of the line
          guideCursor.visible = true
          positionAtT(guideCursor.position, t, p, v, gravity)
        } else {
          guideCursor.visible = false
        }
      }
    }

    for (const entity of avatarTeleportQuery.exit(world)) {
      // Get cursor position and teleport avatar to it
      const { p, v, t } = getParabolaInputParams(guidingController, initialVelocity, gravity)
      const newPosition = positionAtT(currentVertexLocal, t, p, v, gravity)
      teleportAvatar(entity, newPosition)

      guideCursor.visible = false
      guidingController.remove(guideline)
    }
  }
}
