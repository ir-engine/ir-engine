import { Euler, Quaternion } from 'three'

import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '@xrengine/engine/src/physics/components/RigidBodyComponent'
import { GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { updateEntityTransform } from '@xrengine/engine/src/transform/systems/TransformSystem'
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
      rotations: command.affectedNodes.map((node) => {
        if (typeof node === 'string') {
          return obj3dFromUuid(node).rotation.clone() ?? new Euler()
        } else {
          const transform = getComponent(node.entity, TransformComponent)
          const localTransform = getComponent(node.entity, LocalTransformComponent) || transform
          return new Euler().setFromQuaternion(localTransform.rotation)
        }
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
}

function updateRotation(command: RotationCommandParams, isUndo: boolean): void {
  const T_QUAT_1 = new Quaternion()
  const T_QUAT_2 = new Quaternion()

  const undo = isUndo && command.undo

  const rotations = undo ? command.undo!.rotations : command.rotations
  const space = undo ? command.undo!.space : command.space

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]

    if (typeof node === 'string') {
      const obj3d = obj3dFromUuid(node)
      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        obj3d.quaternion.copy(T_QUAT_1)
        obj3d.updateMatrix()
      } else {
        obj3d.updateMatrixWorld()
        const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

        obj3d.quaternion.copy(newLocalQuaternion)
      }
    } else {
      const transform = getComponent(node.entity, TransformComponent)
      const localTransform = getComponent(node.entity, LocalTransformComponent) || transform

      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        localTransform.rotation.copy(T_QUAT_1)
      } else {
        const parentTransform = node.parentEntity ? getComponent(node.parentEntity, TransformComponent) : transform

        const _spaceMatrix = space === TransformSpace.World ? parentTransform.matrix : getSpaceMatrix()

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

        localTransform.rotation.copy(newLocalQuaternion)
        updateEntityTransform(node.entity)
      }
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
