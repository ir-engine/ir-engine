import { Matrix3, Matrix4, Quaternion, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
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

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function FlyControlSystem(world: World) {
  const flyControlQuery = defineQuery([FlyControlComponent])
  const direction = new Vector3()
  const parentInverse = new Matrix4()
  const tempVec3 = new Vector3()
  const quat = new Quaternion()
  const worldPos = new Vector3()
  const worldQuat = new Quaternion()
  const worldScale = new Vector3()
  const candidateWorldQuat = new Quaternion()
  const normalMatrix = new Matrix3()
  const editorHelperState = accessEditorHelperState()

  return () => {
    for (let entity of flyControlQuery()) {
      const flyControlComponent = getComponent(entity, FlyControlComponent)

      if (getInput(EditorActionSet.disableFlyMode)) {
        const cameraComponent = getComponent(Engine.instance.currentWorld.activeCameraEntity, EditorCameraComponent)
        const cameraObject = getComponent(Engine.instance.currentWorld.activeCameraEntity, Object3DComponent)

        removeInputActionMapping(ActionSets.FLY)
        const distance = cameraObject.value.position.distanceTo(cameraComponent.center)
        cameraComponent.center.addVectors(
          cameraObject.value.position,
          tempVec3.set(0, 0, -distance).applyMatrix3(normalMatrix.getNormalMatrix(cameraObject.value.matrix))
        )

        dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: false }))
      }

      if (getInput(EditorActionSet.flying)) {
        addInputActionMapping(ActionSets.FLY, FlyMapping)
        dispatchAction(EditorHelperAction.changedFlyMode({ isFlyModeEnabled: true }))
      }

      if (!editorHelperState.isFlyModeEnabled.value) return

      // assume that Engine.instance.currentWorld.camera[position,quaterion/rotation,scale] are authority
      Engine.instance.currentWorld.camera.updateMatrix()
      Engine.instance.currentWorld.camera.updateMatrixWorld()
      Engine.instance.currentWorld.camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)

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
        Engine.instance.currentWorld.camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
        // assume that if camera.parent exists, its matrixWorld is up to date
        parentInverse
          .copy(
            Engine.instance.currentWorld.camera.parent
              ? Engine.instance.currentWorld.camera.parent.matrixWorld
              : IDENTITY
          )
          .invert()
        Engine.instance.currentWorld.camera.matrix.multiplyMatrices(
          parentInverse,
          Engine.instance.currentWorld.camera.matrixWorld
        )
        Engine.instance.currentWorld.camera.matrixWorld.decompose(
          Engine.instance.currentWorld.camera.position,
          Engine.instance.currentWorld.camera.quaternion,
          Engine.instance.currentWorld.camera.scale
        )
      }

      Engine.instance.currentWorld.camera.matrixWorld.decompose(worldPos, worldQuat, worldScale)
      // rotate about the world y axis
      candidateWorldQuat.multiplyQuaternions(
        quat.setFromAxisAngle(UP, getInput(FlyActionSet.lookX) * flyControlComponent.lookSensitivity),
        worldQuat
      )

      Engine.instance.currentWorld.camera.matrixWorld.compose(worldPos, candidateWorldQuat, worldScale)
      Engine.instance.currentWorld.camera.matrix.multiplyMatrices(
        parentInverse,
        Engine.instance.currentWorld.camera.matrixWorld
      )
      Engine.instance.currentWorld.camera.matrix.decompose(
        Engine.instance.currentWorld.camera.position,
        Engine.instance.currentWorld.camera.quaternion,
        Engine.instance.currentWorld.camera.scale
      )

      // translate
      direction.set(getInput(FlyActionSet.moveX), 0, getInput(FlyActionSet.moveZ))
      const boostSpeed = getInput(FlyActionSet.boost) ? flyControlComponent.boostSpeed : 1
      const speed = world.deltaSeconds * flyControlComponent.moveSpeed * boostSpeed

      if (direction.lengthSq() > EPSILON) Engine.instance.currentWorld.camera.translateOnAxis(direction, speed)

      Engine.instance.currentWorld.camera.position.y +=
        getInput(FlyActionSet.moveY) * world.deltaSeconds * flyControlComponent.moveSpeed * boostSpeed
    }
  }
}
