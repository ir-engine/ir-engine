import { Matrix3, Matrix4, Quaternion, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { EditorCameraComponent } from '../classes/EditorCameraComponent'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import { ActionSets, EditorActionSet, FlyActionSet, FlyMapping } from '../controls/input-mappings'
import { addInputActionMapping, getInput, removeInputActionMapping } from '../functions/parseInputActionMapping'
import { accessEditorHelperState, EditorHelperAction } from '../services/EditorHelperState'

const EPSILON = 10e-5
const UP = new Vector3(0, 1, 0)
const IDENTITY = new Matrix4().identity()

export default async function FlyControlSystem(world: World) {
  const flyControlQuery = defineQuery([FlyControlComponent])
  const direction = new Vector3()
  const parentInverse = new Matrix4()
  const tempVec3 = new Vector3()
  const quat = new Quaternion()
  const worldPos = new Vector3()
  const worldQuat = new Quaternion()
  const worldScale = new Vector3(1, 1, 1)
  const candidateWorldQuat = new Quaternion()
  const normalMatrix = new Matrix3()
  const editorHelperState = accessEditorHelperState()

  const execute = () => {
    for (let entity of flyControlQuery()) {
      const flyControlComponent = getComponent(entity, FlyControlComponent)
      const camera = Engine.instance.currentWorld.camera

      if (getInput(EditorActionSet.disableFlyMode)) {
        const cameraComponent = getComponent(Engine.instance.currentWorld.cameraEntity, EditorCameraComponent)

        removeInputActionMapping(ActionSets.FLY)
        const distance = camera.position.distanceTo(cameraComponent.center)
        cameraComponent.center.addVectors(
          camera.position,
          tempVec3.set(0, 0, -distance).applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        )

        dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
      }

      if (getInput(EditorActionSet.flying)) {
        addInputActionMapping(ActionSets.FLY, FlyMapping)
        dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: true }))
      }

      if (!editorHelperState.isFlyModeEnabled.value) return

      camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)

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
        camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
        // assume that if camera.parent exists, its matrixWorld is up to date
        parentInverse.copy(camera.parent ? camera.parent.matrixWorld : IDENTITY).invert()
        camera.matrix.multiplyMatrices(parentInverse, camera.matrixWorld)
        camera.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale)
      }

      camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)
      // rotate about the world y axis
      candidateWorldQuat.multiplyQuaternions(
        quat.setFromAxisAngle(UP, getInput(FlyActionSet.lookX) * flyControlComponent.lookSensitivity),
        worldQuat
      )

      camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
      camera.matrix.multiplyMatrices(parentInverse, camera.matrixWorld)
      camera.matrix.decompose(camera.position, camera.quaternion, camera.scale)

      // translate
      direction.set(getInput(FlyActionSet.moveX), 0, getInput(FlyActionSet.moveZ))
      const boostSpeed = getInput(FlyActionSet.boost) ? flyControlComponent.boostSpeed : 1
      const speed = world.deltaSeconds * flyControlComponent.moveSpeed * boostSpeed

      if (direction.lengthSq() > EPSILON) camera.translateOnAxis(direction, speed)

      camera.position.y +=
        getInput(FlyActionSet.moveY) * world.deltaSeconds * flyControlComponent.moveSpeed * boostSpeed
    }
  }

  const cleanup = async () => {
    removeQuery(world, flyControlQuery)
  }

  return { execute, cleanup }
}
