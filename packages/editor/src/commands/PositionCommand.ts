import { Matrix4, Vector3 } from 'three'

import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/LocalTransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, TransformCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3D, serializeVector3 } from '../functions/debug'
import { getSpaceMatrix } from '../functions/getSpaceMatrix'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type PositionCommandUndoParams = {
  positions: Vector3[]
  space: TransformSpace
  addToPosition: boolean
}

export type PositionCommandParams = CommandParams & {
  type: TransformCommands.POSITION

  positions: Vector3[]

  space?: TransformSpace

  addToPosition?: boolean

  undo?: PositionCommandUndoParams
}

function prepare(command: PositionCommandParams) {
  if (typeof command.space === 'undefined') command.space = TransformSpace.Local

  if (command.keepHistory) {
    command.undo = {
      positions: command.affectedNodes.map((o) => {
        return getComponent(o.entity, TransformComponent)?.position.clone() ?? new Vector3()
      }),
      space: TransformSpace.Local,
      addToPosition: false
    }
  }
}

function shouldUpdate(currentCommnad: PositionCommandParams, newCommand: PositionCommandParams): boolean {
  return (
    currentCommnad.space === newCommand.space &&
    arrayShallowEqual(currentCommnad.affectedNodes, newCommand.affectedNodes)
  )
}

function update(currentCommnad: PositionCommandParams, newCommand: PositionCommandParams) {
  currentCommnad.positions = newCommand.positions
  execute(currentCommnad)
}

function execute(command: PositionCommandParams) {
  updatePosition(command, false)
  emitEventAfter(command)
}

function undo(command: PositionCommandParams) {
  updatePosition(command, true)
  emitEventAfter(command)
}

function emitEventAfter(command: PositionCommandParams) {
  if (command.preventEvents) return

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedObject({ objects: command.affectedNodes, propertyName: 'position' }))
}

function updatePosition(command: PositionCommandParams, isUndo?: boolean) {
  const tempMatrix = new Matrix4()
  const tempVector = new Vector3()

  const undo = isUndo && command.undo

  const positions = undo ? command.undo!.positions : command.positions
  const space = undo ? command.undo!.space : command.space
  const addToPosition = undo ? command.undo!.addToPosition : command.addToPosition

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]
    const pos = positions[i] ?? positions[0]

    /** @todo figure out native local transform support */
    // const transformComponent = hasComponent(node.entity, LocalTransformComponent) ? getComponent(node.entity, LocalTransformComponent) : getComponent(node.entity, TransformComponent)
    const transformComponent = getComponent(node.entity, TransformComponent)

    if (space === TransformSpace.Local) {
      if (addToPosition) transformComponent.position.add(pos)
      else transformComponent.position.copy(pos)
    } else {
      const obj3d = getComponent(node.entity, Object3DComponent)?.value
      if (!obj3d) continue
      obj3d.updateMatrixWorld() // Update parent world matrices

      if (addToPosition) {
        tempVector.setFromMatrixPosition(obj3d.matrixWorld)
        tempVector.add(pos)
      }

      const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()

      tempMatrix.copy(_spaceMatrix).invert()
      tempVector.applyMatrix4(tempMatrix)
      transformComponent.position.copy(tempVector)
    }
  }
}

function toString(command: PositionCommandParams) {
  return `SetPositionCommand id: ${command.id} object: ${serializeObject3D(
    command.affectedNodes
  )} position: ${serializeVector3(command.positions)} space: ${command.space}`
}

export const PositionCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  shouldUpdate,
  update,
  emitEventAfter,
  toString
}
