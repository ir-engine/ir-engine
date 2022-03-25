// import { ParityValue } from 'src/common/enums/ParityValue'
// import { getHandPosition } from 'src/xr/functions/WebXRFunctions'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  PointLight,
  Vector3
} from 'three'

import { normalizeRange } from '@xrengine/common/src/utils/mathUtils'

import { World } from '../ecs/classes/World'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
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
const tempVec = new Vector3()
const tempVec1 = new Vector3()
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

  // The light at the end of the line
  const guideLight = new PointLight(0xffeeaa, 0, 2)

  let guidingController = new Group()

  const avatarTeleportQuery = defineQuery([AvatarTeleportTagComponent])
  return () => {
    for (const entity of avatarTeleportQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const controller = xrInputSourceComponent.controllerRightParent
      guidingController = controller
      guideLight.intensity = 1
      guidingController.add(guideline)
    }

    for (const entity of avatarTeleportQuery(world)) {
      if (guidingController) {
        const { p, v, t } = getParabolaInputParams(guidingController, initialVelocity, gravity)

        const vertex = tempVec.set(0, 0, 0)
        for (let i = 1; i <= lineSegments; i++) {
          // set vertex to current position of the virtual ball at time t
          positionAtT(vertex, (i * t) / lineSegments, p, v, gravity)
          guidingController.worldToLocal(vertex)
          vertex.toArray(lineGeometryVertices, i * 3)
        }
        guideline.geometry.attributes.position.needsUpdate = true

        // Place the light and sprite near the end of the line
        positionAtT(guideLight.position, t * 0.98, p, v, gravity)
        // positionAtT(guideSprite.position,t*0.98,p,v,g);
      }
    }

    for (const entity of avatarTeleportQuery.exit(world)) {
      // Get cursor position and teleport avatar to it
      const { p, v, t } = getParabolaInputParams(guidingController, initialVelocity, gravity)
      const newPosition = positionAtT(tempVec1, t, p, v, gravity)
      teleportAvatar(entity, newPosition)

      guideLight.intensity = 0
      guidingController.remove(guideline)
    }
  }
}
