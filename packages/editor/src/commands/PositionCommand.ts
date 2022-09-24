import { Matrix4, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '@xrengine/engine/src/physics/components/RigidBodyComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
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
        if (typeof o === 'string') {
          return obj3dFromUuid(o)?.position.clone() ?? new Vector3()
        } else {
          return getComponent(o.entity, TransformComponent)?.position.clone() ?? new Vector3()
        }
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

    const isObj3d = typeof node === 'string'

    if (isObj3d) {
      const obj3d = obj3dFromUuid(node)
      if (space === TransformSpace.Local) {
        if (addToPosition) obj3d.position.add(pos)
        else obj3d.position.copy(pos)
      } else {
        obj3d.updateMatrixWorld()
        if (addToPosition) {
          tempVector.setFromMatrixPosition(obj3d.matrixWorld)
          tempVector.add(pos)
        }

        const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()
        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        obj3d.position.copy(tempVector)
      }
      obj3d.updateMatrix()
    } else {
      const transform = getComponent(node.entity, TransformComponent)
      const localTransform = getComponent(node.entity, LocalTransformComponent) || transform

      if (space === TransformSpace.Local) {
        if (addToPosition) localTransform.position.add(pos)
        else localTransform.position.copy(pos)
      } else {
        const parentTransform = node.parentEntity ? getComponent(node.parentEntity, TransformComponent) : transform

        if (addToPosition) {
          tempVector.setFromMatrixPosition(transform.matrix)
          tempVector.add(pos)
        }

        const _spaceMatrix = space === TransformSpace.World ? parentTransform.matrix : getSpaceMatrix()
        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        localTransform.position.copy(tempVector)
      }
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
