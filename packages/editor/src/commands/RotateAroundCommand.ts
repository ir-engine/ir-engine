import { Matrix4, Vector3 } from 'three'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, TransformCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type RotateAroundCommandUndoParams = {
  axis: Vector3

  angle: number

  pivot: Vector3
}

export type RotateAroundCommandParams = CommandParams & {
  type: TransformCommands.ROTATE_AROUND

  axis: Vector3

  angle: number

  pivot: Vector3

  undo?: RotateAroundCommandUndoParams
}

function prepare(command: RotateAroundCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      pivot: command.pivot,
      axis: command.axis,
      angle: command.angle * -1
    }
  }
}

function shouldUpdate(currentCommnad: RotateAroundCommandParams, newCommand: RotateAroundCommandParams): boolean {
  return (
    currentCommnad.pivot.equals(newCommand.pivot) &&
    currentCommnad.axis.equals(newCommand.axis) &&
    arrayShallowEqual(currentCommnad.affectedNodes, newCommand.affectedNodes)
  )
}

function update(currentCommnad: RotateAroundCommandParams, newCommand: RotateAroundCommandParams) {
  const oldAngle = currentCommnad.angle
  currentCommnad.angle = newCommand.angle
  execute(currentCommnad)
  currentCommnad.angle += oldAngle
  emitEventAfter(currentCommnad)
}

function execute(command: RotateAroundCommandParams) {
  rotateAround(command, false)
  emitEventAfter(command)
}

function undo(command: RotateAroundCommandParams) {
  rotateAround(command, true)
  emitEventAfter(command)
}

function emitEventAfter(command: RotateAroundCommandParams) {
  if (command.preventEvents) return

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedObject({ objects: command.affectedNodes, propertyName: 'matrix' }))
}

function rotateAround(command: RotateAroundCommandParams, isUndo?: boolean) {
  let pivot = command.pivot
  let axis = command.axis
  let angle = command.angle

  if (isUndo && command.undo) {
    pivot = command.undo.pivot
    axis = command.undo.axis
    angle = command.undo.angle
  }

  const pivotToOriginMatrix = new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z)
  const originToPivotMatrix = new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
  const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle)

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const obj3d = getComponent(command.affectedNodes[i].entity, Object3DComponent).value
    const transform = getComponent(command.affectedNodes[i].entity, TransformComponent)

    new Matrix4()
      .copy(obj3d.matrixWorld)
      .premultiply(pivotToOriginMatrix)
      .premultiply(rotationMatrix)
      .premultiply(originToPivotMatrix)
      .premultiply(obj3d.parent!.matrixWorld.clone().invert())
      .decompose(transform.position, transform.rotation, transform.scale)
  }
}

function toString(command: RotateAroundCommandParams) {
  return `RotateAroundMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(command.affectedNodes)}
  pivot: ${serializeVector3(command.pivot)} axis: { ${serializeVector3(command.axis)} angle: ${command.angle} }`
}

export const RotateAroundCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  shouldUpdate,
  update,
  emitEventAfter,
  toString
}
