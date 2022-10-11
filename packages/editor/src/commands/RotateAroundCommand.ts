import { Matrix4, Vector3 } from 'three'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, TransformCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'

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
    const node = command.affectedNodes[i]
    if (typeof node === 'string') {
      const obj3d = obj3dFromUuid(node)
      const matrixWorld = new Matrix4()
        .copy(obj3d.matrixWorld)
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(obj3d.parent!.matrixWorld.clone().invert())
      obj3d.matrixWorld.copy(matrixWorld)
    } else {
      const transform = getComponent(node.entity, TransformComponent)
      const localTransform = getComponent(node.entity, LocalTransformComponent) || transform
      const parentTransform = node.parentEntity ? getComponent(node.parentEntity, TransformComponent) : transform

      new Matrix4()
        .copy(transform.matrix)
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(parentTransform.matrixInverse)
        .decompose(localTransform.position, localTransform.rotation, localTransform.scale)
    }
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
