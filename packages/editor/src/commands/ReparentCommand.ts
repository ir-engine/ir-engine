import { Vector3 } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  getEntityNodeArrayFromEntities,
  reparentEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export interface ReparentCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents: EntityTreeNode | EntityTreeNode[]

  /** Child object before which all objects will be added */
  befores?: EntityTreeNode | EntityTreeNode[]

  positions?: Vector3[]
}

export default class ReparentCommand extends Command {
  parents: EntityTreeNode[]

  befores?: EntityTreeNode[]

  positions?: Vector3[]

  oldParents: EntityTreeNode[]

  oldBefores: EntityTreeNode[]

  oldPositions: Vector3[]

  constructor(objects: EntityTreeNode[], params: ReparentCommandParams) {
    super(objects, params)

    this.parents = Array.isArray(params.parents) ? params.parents : [params.parents]
    this.befores = params.befores ? (Array.isArray(params.befores) ? params.befores : [params.befores]) : undefined
    this.positions = params.positions

    if (this.keepHistory) {
      this.oldParents = []
      this.oldBefores = []
      this.oldPositions = []
      this.oldSelection = accessSelectionState().selectedEntities.value.slice(0)

      const tree = useWorld().entityTree

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]

        if (obj.parentEntity) {
          const parent = tree.entityNodeMap.get(obj.parentEntity)
          if (!parent) throw new Error('Parent is not defined')
          this.oldParents.push(parent)

          const before = tree.entityNodeMap.get(parent.children![parent.children!.indexOf(obj.entity) + 1])
          this.oldBefores.push(before!)
        }

        this.oldPositions.push(getComponent(obj.entity, TransformComponent)?.position.clone())
      }
    }
  }

  execute() {
    this.emitBeforeExecuteEvent()

    this.reparent(this.affectedObjects, this.parents, this.befores)

    if (this.positions) {
      executeCommand(EditorCommands.POSITION, this.affectedObjects, {
        positions: this.positions,
        space: TransformSpace.Local
      })
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    this.isSelected = false
    this.shouldEmitEvent = false
    this.reparent(this.affectedObjects, this.oldParents, this.oldBefores)
    this.shouldEmitEvent = true
    this.isSelected = true

    if (this.positions) {
      executeCommand(EditorCommands.POSITION, this.affectedObjects, {
        positions: this.oldPositions,
        space: TransformSpace.Local,
        shouldEmitEvent: false
      })
    }

    executeCommand(EditorCommands.REPLACE_SELECTION, getEntityNodeArrayFromEntities(this.oldSelection))

    this.emitAfterExecuteEvent()
  }

  toString() {
    return `${this.constructor.name} id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} newParent: ${serializeObject3D(this.parents)} newBefore: ${serializeObject3D(this.befores)}`
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent && this.isSelected) {
      cancelGrabOrPlacement()
      store.dispatch(SelectionAction.changedBeforeSelection())
    }
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      if (this.isSelected) {
        updateOutlinePassSelection()
      }

      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedSceneGraph())
    }
  }

  reparent(objects: EntityTreeNode[], parents: EntityTreeNode[], befores?: EntityTreeNode[]): void {
    for (let i = 0; i < objects.length; i++) {
      const parent = parents[i] ?? parents[0]
      if (!parent) continue

      const object = objects[i]
      const before = befores ? befores[i] ?? befores[0] : undefined
      const index = before && parent.children ? parent.children.indexOf(before.entity) : undefined

      reparentEntityNode(object, parent, index)
      reparentObject3D(object, parent, before)
    }

    if (this.isSelected) {
      executeCommand(EditorCommands.REPLACE_SELECTION, objects, {
        shouldEmitEvent: false
      })
    }
  }
}
