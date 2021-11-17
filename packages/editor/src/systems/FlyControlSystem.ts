import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Vector3, Matrix4, Quaternion } from 'three'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import { FlyActionSet } from '../controls/input-mappings'
import { getInput } from '../functions/parseInputActionMapping'
import { ControlManager } from '../managers/ControlManager'

const EPSILON = 10e-5
const UP = new Vector3(0, 1, 0)
const IDENTITY = new Matrix4().identity()

export default async function FlyControlSystem(world: World): Promise<System> {
  const flyControlQuery = defineQuery([FlyControlComponent])
  const direction = new Vector3()
  const parentInverse = new Matrix4()
  const tempVec3 = new Vector3()
  const quat = new Quaternion()
  const worldPos = new Vector3()
  const worldQuat = new Quaternion()
  const worldScale = new Vector3()
  const candidateWorldQuat = new Quaternion()

  return () => {
    for (let entity of flyControlQuery()) {
      const flyControlComponent = getComponent(entity, FlyControlComponent)

      if (!flyControlComponent.enable) return

      // assume that Engine.camera[position,quaterion/rotation,scale] are authority
      Engine.camera.updateMatrix()
      Engine.camera.updateMatrixWorld()
      Engine.camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)

      // rotate about the camera's local x axis
      candidateWorldQuat.multiplyQuaternions(
        quat.setFromAxisAngle(
          tempVec3.set(1, 0, 0).applyQuaternion(worldQuat),
          getInput(FlyActionSet.lookY) * flyControlComponent.lookSensitivity
        ),
        worldQuat
      )

      // check change of local "forward" and "up" to disallow flipping
      const camUpY = tempVec3.set(0, 1, 0).applyQuaternion(worldQuat).y
      const newCamUpY = tempVec3.set(0, 1, 0).applyQuaternion(candidateWorldQuat).y
      const newCamForwardY = tempVec3.set(0, 0, -1).applyQuaternion(candidateWorldQuat).y
      const extrema = Math.sin(flyControlComponent.maxXRotation)
      const allowRotationInX =
        newCamUpY > 0 && ((newCamForwardY < extrema && newCamForwardY > -extrema) || newCamUpY > camUpY)

      if (allowRotationInX) {
        Engine.camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
        // assume that if camera.parent exists, its matrixWorld is up to date
        parentInverse.copy(Engine.camera.parent ? Engine.camera.parent.matrixWorld : IDENTITY).invert()
        Engine.camera.matrix.multiplyMatrices(parentInverse, Engine.camera.matrixWorld)
        Engine.camera.matrixWorld.decompose(Engine.camera.position, Engine.camera.quaternion, Engine.camera.scale)
      }

      Engine.camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)
      // rotate about the world y axis
      candidateWorldQuat.multiplyQuaternions(
        quat.setFromAxisAngle(UP, getInput(FlyActionSet.lookX) * flyControlComponent.lookSensitivity),
        worldQuat
      )

      Engine.camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
      Engine.camera.matrix.multiplyMatrices(parentInverse, Engine.camera.matrixWorld)
      Engine.camera.matrix.decompose(Engine.camera.position, Engine.camera.quaternion, Engine.camera.scale)

      // translate
      direction.set(getInput(FlyActionSet.moveX), 0, getInput(FlyActionSet.moveZ))
      const boostSpeed = getInput(FlyActionSet.boost) ? flyControlComponent.boostSpeed : 1
      const speed = world.delta * flyControlComponent.moveSpeed * boostSpeed

      if (direction.lengthSq() > EPSILON) Engine.camera.translateOnAxis(direction, speed)

      Engine.camera.position.y +=
        getInput(FlyActionSet.moveY) * world.delta * flyControlComponent.moveSpeed * boostSpeed
    }
  }
}
