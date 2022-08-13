import { Euler, Quaternion } from 'three'

import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/LocalTransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

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

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedObject({ objects: command.affectedNodes, propertyName: 'rotation' }))
}

function updateRotation(command: RotationCommandParams, isUndo: boolean): void {
  const T_QUAT_1 = new Quaternion()
  const T_QUAT_2 = new Quaternion()

  const undo = isUndo && command.undo

  const rotations = undo ? command.undo!.rotations : command.rotations
  const space = undo ? command.undo!.space : command.space

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]
    const obj3d = getComponent(node.entity, Object3DComponent).value
    /** @todo figure out native local transform support */
    // const transformComponent = hasComponent(node.entity, LocalTransformComponent) ? getComponent(node.entity, LocalTransformComponent) : getComponent(node.entity, TransformComponent)
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
