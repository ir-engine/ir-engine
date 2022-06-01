import { Euler, Quaternion } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { CommandFuncType, CommandParams, TransformCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeEuler, serializeObject3DArray } from '../functions/debug'
import { getSpaceMatrix } from '../functions/getSpaceMatrix'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type RotationCommandUndoParams = {
  rotations: Euler[]
  space: TransformSpace
}

export type RotationCommandParams = CommandParams & {
  type: TransformCommands.ROTATION

  rotations: Euler[]

  space?: TransformSpace

  undo?: RotationCommandUndoParams
}

function prepare(command: RotationCommandParams) {
  if (typeof command.space === 'undefined') command.space = TransformSpace.Local

  if (command.keepHistory) {
    command.undo = {
      rotations: command.affectedNodes.map((o) => {
        return getComponent(o.entity, Object3DComponent).value.rotation.clone() ?? new Euler()
      }),
      space: TransformSpace.Local
    }
  }
}

function shouldUpdate(currentCommnad: RotationCommandParams, newCommand: RotationCommandParams): boolean {
  return (
    currentCommnad.space === newCommand.space &&
    arrayShallowEqual(currentCommnad.affectedNodes, newCommand.affectedNodes)
  )
}

function update(currentCommnad: RotationCommandParams, newCommand: RotationCommandParams) {
  currentCommnad.rotations = newCommand.rotations
  execute(currentCommnad)
}

function execute(command: RotationCommandParams) {
  updateRotation(command, false)
  emitEventAfter(command)
}

function undo(command: RotationCommandParams) {
  updateRotation(command, true)
  emitEventAfter(command)
}

function emitEventAfter(command: RotationCommandParams) {
  if (command.preventEvents) return

  store.dispatch(EditorAction.sceneModified(true))
  store.dispatch(SelectionAction.changedObject(command.affectedNodes, 'rotation'))
}

function updateRotation(command: RotationCommandParams, isUndo: boolean): void {
  const T_QUAT_1 = new Quaternion()
  const T_QUAT_2 = new Quaternion()
  let rotations = command.rotations
  let space = command.space

  if (isUndo && command.undo) {
    rotations = command.undo.rotations
    space = command.undo.space
  }

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]
    const obj3d = getComponent(node.entity, Object3DComponent).value
    const transformComponent = getComponent(node.entity, TransformComponent)

    T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

    if (space === TransformSpace.Local) {
      transformComponent.rotation.copy(T_QUAT_1)
    } else {
      obj3d.updateMatrixWorld() // Update parent world matrices

      const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()

      const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
      const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

      transformComponent.rotation.copy(newLocalQuaternion)
    }
  }
}

function toString(command: RotationCommandParams) {
  return `SetRotationMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} rotation: ${serializeEuler(command.rotations)} space: ${command.space}`
}

export const RotationCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  shouldUpdate,
  update,
  emitEventAfter,
  toString
}
