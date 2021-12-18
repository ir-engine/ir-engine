import { Vector3 } from 'three'
import Command, { CommandParams } from './Command'
import { serializeObject3DArray, serializeObject3D } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

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
      this.oldSelection = CommandManager.instance.selected.slice(0)
      this.oldPositions = objects.map((o) => getComponent(o.entity, TransformComponent).position.clone())

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]
        if (obj.parentNode) {
          this.oldParents.push(obj.parentNode)
          this.oldBefores.push(obj.parentNode.children![obj.parentNode.children!.indexOf(obj) + 1])
        }
      }
    }
  }

  execute() {
    this.emitBeforeExecuteEvent()

    this.reparent(this.affectedObjects, this.parents, this.befores)

    if (this.positions) {
      CommandManager.instance.executeCommand(EditorCommands.POSITION, this.affectedObjects, {
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
      CommandManager.instance.executeCommand(EditorCommands.POSITION, this.affectedObjects, {
        positions: this.oldPositions,
        space: TransformSpace.Local,
        shouldEmitEvent: false
      })
    }

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection, {
      shouldGizmoUpdate: false
    })

    CommandManager.instance.updateTransformRoots()
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `${this.constructor.name} id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} newParent: ${serializeObject3D(this.parents)} newBefore: ${serializeObject3D(this.befores)}`
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent && this.isSelected)
      CommandManager.instance.emitEvent(EditorEvents.BEFORE_SELECTION_CHANGED)
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      if (this.isSelected) {
        CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
      }

      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }

  reparent(objects: EntityTreeNode[], parents: EntityTreeNode[], befores?: EntityTreeNode[]): void {
    for (let i = 0; i < objects.length; i++) {
      const parent = parents[i] ?? parents[0]
      if (!parent) continue

      const object = objects[i]
      const before = befores ? befores[i] ?? befores[0] : undefined
      const index = before ? parent.children?.indexOf(before) : undefined

      object.reparent(parent, index)
      reparentObject3D(object, parent, before)
    }

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, objects, {
        shouldEmitEvent: false,
        shouldGizmoUpdate: false
      })
    }

    CommandManager.instance.updateTransformRoots()
  }
}
