import { Matrix4, Vector3 } from 'three'

import multiLogger from '@xrengine/common/src/logger'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ColliderComponent } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { GLTFLoadedComponent } from '@xrengine/engine/src/scene/components/GLTFLoadedComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { updateCollider, updateModelColliders } from '@xrengine/engine/src/scene/functions/loaders/ColliderFunctions'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, TransformCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { getSpaceMatrix } from '../functions/getSpaceMatrix'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

const logger = multiLogger.child({ component: 'editor:ScaleCommand' })

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
      scales: command.affectedNodes.map((node) => {
        if (typeof node === 'string') {
          return obj3dFromUuid(node).scale.clone()
        } else {
          const transform = getComponent(node.entity, TransformComponent)
          const localTransform = getComponent(node.entity, LocalTransformComponent) || transform
          return localTransform.scale.clone()
        }
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

  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

function updateScale(command: ScaleCommandParams, isUndo: boolean): void {
  const undo = isUndo && command.undo

  const scales = undo ? command.undo!.scales : command.scales
  const space = undo ? command.undo!.space : command.space
  const overrideScale = undo ? command.undo!.overrideScale : command.overrideScale

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]
    const scale = scales[i] ?? scales[0]

    if (space === TransformSpace.World && (scale.x !== scale.y || scale.x !== scale.z || scale.y !== scale.z)) {
      logger.warn('Scaling an object in world space with a non-uniform scale is not supported')
    }

    const transformComponent =
      typeof node === 'string'
        ? obj3dFromUuid(node)
        : getComponent(node.entity, LocalTransformComponent) ?? getComponent(node.entity, TransformComponent)

    if (overrideScale) {
      transformComponent.scale.copy(scale)
    } else {
      transformComponent.scale.multiply(scale)
    }

    transformComponent.scale.set(
      transformComponent.scale.x === 0 ? Number.EPSILON : transformComponent.scale.x,
      transformComponent.scale.y === 0 ? Number.EPSILON : transformComponent.scale.y,
      transformComponent.scale.z === 0 ? Number.EPSILON : transformComponent.scale.z
    )

    if (typeof node !== 'string' && hasComponent(node.entity, ColliderComponent)) {
      if (hasComponent(node.entity, GLTFLoadedComponent)) {
        updateModelColliders(node.entity)
      } else {
        updateCollider(node.entity)
      }
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
