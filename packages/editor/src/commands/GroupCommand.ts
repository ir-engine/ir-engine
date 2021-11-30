import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import Command, { CommandParams } from './Command'
import { serializeObject3DArray, serializeObject3D } from '../functions/debug'
import reverseDepthFirstTraverse from '../functions/reverseDepthFirstTraverse'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import GroupNode from '../nodes/GroupNode'

export interface GroupCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: any

  /** Child object before which all objects will be added */
  befores?: any
}

export default class GroupCommand extends Command {
  undoObjects: any[]

  groupParent: any

  groupBefore: any

  oldParents: any[]

  oldBefores: any[]

  groupNode: any

  constructor(objects?: any | any[], params?: GroupCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = []
    this.undoObjects = []
    this.groupParent = params.parents
    this.groupBefore = params.befores
    this.oldParents = []
    this.oldBefores = []
    this.oldSelection = CommandManager.instance.selected.slice(0)

    useEngine().scene.traverse((object) => {
      if (objects.indexOf(object) !== -1) {
        this.affectedObjects.push(object)
      }
    })

    // Sort objects, parents, and befores with a reverse depth first search so that undo adds nodes in the correct order
    reverseDepthFirstTraverse(useEngine().scene, (object) => {
      if (objects.indexOf(object) !== -1) {
        this.undoObjects.push(object)
        this.oldParents.push(object.parent)
        if (object.parent) {
          const siblings = object.parent.children
          const index = siblings.indexOf(object)
          if (index + 1 < siblings.length) {
            this.oldBefores.push(siblings[index + 1])
          } else {
            this.oldBefores.push(undefined)
          }
        }
      }
    })
    this.groupNode = null
  }

  execute() {
    this.emitBeforeExecuteEvent()

    this.groupNode = new GroupNode(this)
    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.groupNode, {
      parents: this.groupParent,
      befores: this.groupBefore,
      shouldEmitEvent: false,
      isObjectSelected: false
    })

    CommandManager.instance.executeCommand(EditorCommands.REPARENT, this.affectedObjects, {
      parents: this.groupNode,
      shouldEmitEvent: false,
      isObjectSelected: false
    })

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.groupNode, {
        shouldEmitEvent: false,
        shouldGizmoUpdate: false
      })
    }

    CommandManager.instance.updateTransformRoots()

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.REPARENT, this.undoObjects, {
      parents: this.oldParents,
      befores: this.oldBefores,
      shouldEmitEvent: false,
      isObjectSelected: false
    })
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.groupNode, {
      deselectObject: false,
      shouldEmitEvent: false
    })
    CommandManager.instance.updateTransformRoots()
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection, {
      shouldGizmoUpdate: false
    })
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `GroupMultipleObjectsCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} groupParent: ${serializeObject3D(this.groupParent)} groupBefore: ${serializeObject3D(this.groupBefore)}`
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
}
