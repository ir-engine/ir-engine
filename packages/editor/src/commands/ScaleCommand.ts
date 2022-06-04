import { Matrix4, Vector3 } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { CommandFuncType, CommandParams, TransformCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { getSpaceMatrix } from '../functions/getSpaceMatrix'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type ScaleCommandUndoParams = {
  scales: Vector3[]
  space: TransformSpace
  overrideScale: boolean
}

export type ScaleCommandParams = CommandParams & {
  type: TransformCommands.SCALE

  scales: Vector3[]

  space?: TransformSpace

  overrideScale?: boolean

  undo?: ScaleCommandUndoParams
}

function prepare(command: ScaleCommandParams) {
  if (typeof command.space === 'undefined') command.space = TransformSpace.Local

  if (command.keepHistory) {
    command.undo = {
      scales: command.affectedNodes.map((o) => {
        return getComponent(o.entity, Object3DComponent).value.scale.clone() ?? new Vector3(1, 1, 1)
      }),
      space: TransformSpace.Local,
      overrideScale: true
    }
  }
}

function shouldUpdate(currentCommnad: ScaleCommandParams, newCommand: ScaleCommandParams): boolean {
  return (
    currentCommnad.space === newCommand.space &&
    arrayShallowEqual(currentCommnad.affectedNodes, newCommand.affectedNodes)
  )
}

function update(currentCommnad: ScaleCommandParams, newCommand: ScaleCommandParams) {
  if (currentCommnad.overrideScale) {
    currentCommnad.scales = newCommand.scales
  } else {
    currentCommnad.scales.forEach((s: Vector3, index: number) => s.multiply(newCommand.scales[index]))
  }

  execute(currentCommnad)
}

function execute(command: ScaleCommandParams) {
  updateScale(command, false)
  emitEventAfter(command)
}

function undo(command: ScaleCommandParams) {
  updateScale(command, true)
  emitEventAfter(command)
}

function emitEventAfter(command: ScaleCommandParams) {
  if (command.preventEvents) return

  store.dispatch(EditorAction.sceneModified(true))
  store.dispatch(SelectionAction.changedObject(command.affectedNodes, 'scale'))
}

function updateScale(command: ScaleCommandParams, isUndo: boolean): void {
  let scales = command.scales
  let space = command.space
  let overrideScale = command.overrideScale

  if (isUndo && command.undo) {
    scales = command.undo.scales
    space = command.undo.space
    overrideScale = command.undo.overrideScale
  }

  if (!overrideScale) {
    for (let i = 0; i < command.affectedNodes.length; i++) {
      const node = command.affectedNodes[i]
      const scale = scales[i] ?? scales[0]

      if (space === TransformSpace.World && (scale.x !== scale.y || scale.x !== scale.z || scale.y !== scale.z)) {
        console.warn('Scaling an object in world space with a non-uniform scale is not supported')
      }

      getComponent(node.entity, TransformComponent).scale.multiply(scale)
    }

    return
  }

  const tempMatrix = new Matrix4()
  const tempVector = new Vector3()

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]

    const scale = scales[i] ?? scales[0]
    let obj3d = getComponent(node.entity, Object3DComponent).value
    let transformComponent = getComponent(node.entity, TransformComponent)

    if (space === TransformSpace.Local) {
      transformComponent.scale.x = scale.x === 0 ? Number.EPSILON : scale.x
      transformComponent.scale.y = scale.y === 0 ? Number.EPSILON : scale.y
      transformComponent.scale.z = scale.z === 0 ? Number.EPSILON : scale.z
    } else {
      obj3d.updateMatrixWorld() // Update parent world matrices

      tempVector.copy(scale)

      let _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()

      tempMatrix.copy(_spaceMatrix).invert()
      tempVector.applyMatrix4(tempMatrix)

      tempVector.set(
        tempVector.x === 0 ? Number.EPSILON : tempVector.x,
        tempVector.y === 0 ? Number.EPSILON : tempVector.y,
        tempVector.z === 0 ? Number.EPSILON : tempVector.z
      )

      transformComponent.scale.copy(tempVector)
    }
  }
}

function toString(command: ScaleCommandParams) {
  return `SetScaleMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} scale: ${serializeVector3(command.scales)} space: ${command.space}`
}

export const ScaleCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  shouldUpdate,
  update,
  emitEventAfter,
  toString
}
