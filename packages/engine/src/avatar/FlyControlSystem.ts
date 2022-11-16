import { Matrix3, Matrix4, Quaternion, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { V_010 } from '../common/constants/MathConstants'
import { InputComponent } from '../input/components/InputComponent'
import { MouseInput } from '../input/enums/InputEnums'
import { FlyControlComponent } from './components/FlyControlComponent'

const EPSILON = 10e-5
const IDENTITY = new Matrix4().identity()

export default async function FlyControlSystem(world: World) {
  const flyControlQuery = defineQuery([FlyControlComponent, InputComponent])
  const direction = new Vector3()
  const parentInverse = new Matrix4()
  const tempVec3 = new Vector3()
  const quat = new Quaternion()
  const worldPos = new Vector3()
  const worldQuat = new Quaternion()
  const worldScale = new Vector3(1, 1, 1)
  const candidateWorldQuat = new Quaternion()

  const execute = () => {
    for (const entity of flyControlQuery()) {
      const flyControlComponent = getComponent(entity, FlyControlComponent)
      const camera = Engine.instance.currentWorld.camera

      const mouseMovement = world.inputState.get(MouseInput.MouseClickDownMovement)?.value ?? [0, 0]

      camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)

      // rotate about the camera's local x axis
      candidateWorldQuat.multiplyQuaternions(
        quat.setFromAxisAngle(
          tempVec3.set(1, 0, 0).applyQuaternion(worldQuat),
          mouseMovement[1] * flyControlComponent.lookSensitivity
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
        camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
        // assume that if camera.parent exists, its matrixWorld is up to date
        parentInverse.copy(camera.parent ? camera.parent.matrixWorld : IDENTITY).invert()
        camera.matrix.multiplyMatrices(parentInverse, camera.matrixWorld)
        camera.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale)
      }

      camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)
      // rotate about the world y axis
      candidateWorldQuat.multiplyQuaternions(
        quat.setFromAxisAngle(V_010, -mouseMovement[0] * flyControlComponent.lookSensitivity),
        worldQuat
      )

      camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
      camera.matrix.multiplyMatrices(parentInverse, camera.matrixWorld)
      camera.matrix.decompose(camera.position, camera.quaternion, camera.scale)

      const lateralMovement =
        (world.inputState.get('KeyD')?.value[0] ?? 0) - (world.inputState.get('KeyA')?.value[0] ?? 0)
      const forwardMovement =
        (world.inputState.get('KeyS')?.value[0] ?? 0) - (world.inputState.get('KeyW')?.value[0] ?? 0)
      const upwardMovement =
        (world.inputState.get('KeyQ')?.value[0] ?? 0) - (world.inputState.get('KeyE')?.value[0] ?? 0)

      // translate
      direction.set(lateralMovement, 0, forwardMovement)
      const boostSpeed = world.inputState.has('ShiftLeft') ? flyControlComponent.boostSpeed : 1
      const speed = world.deltaSeconds * flyControlComponent.moveSpeed * boostSpeed

      if (direction.lengthSq() > EPSILON) camera.translateOnAxis(direction, speed)

      camera.position.y += upwardMovement * world.deltaSeconds * flyControlComponent.moveSpeed * boostSpeed
    }
  }

  const cleanup = async () => {
    removeQuery(world, flyControlQuery)
  }

  return { execute, cleanup }
}
