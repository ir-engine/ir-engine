import Command from './Command'
import { serializeObject3DArray, serializeObject3D } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import getDetachedObjectsRoots from '../functions/getDetachedObjectsRoots'
import { CommandParams } from '..'
import EditorEvents from '../constants/EditorEvents'

export interface DuplicateObjectCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parent?: any

  /** Child object before which all objects will be added */
  before?: any
}

export default class DuplicateObjectCommand extends Command {
  parent: any

  before: any

  selectObjects: any

  duplicatedObjects: any[]

  constructor(objects?: any | any[], params?: DuplicateObjectCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.parent = params.parent
    this.before = params.before
    this.selectObjects = params.isObjectSelected
    this.oldSelection = CommandManager.instance.selected.slice(0)
    this.duplicatedObjects = []
  }

  execute(isRedoCommand?: boolean) {
    if (isRedoCommand) {
      CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, { parent: this.parent, before: this.before, shouldEmitEvent: false, isObjectSelected: false })
    } else {
      const validNodes = this.affectedObjects.filter((object) => object.constructor.canAddNode())
      const roots = getDetachedObjectsRoots(validNodes)
      this.duplicatedObjects = roots.map((object) => object.clone())

      if (parent) {
        CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, { parent: this.parent, before: this.before, shouldEmitEvent: false, isObjectSelected: false })
      } else {
        for (let i = 0; i < roots.length; i++) {
          CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, [this.duplicatedObjects[i]], { parent: roots[i].parent, shouldEmitEvent: false, isObjectSelected: false })
        }
      }

      if (this.isSelected) {
        CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.duplicatedObjects, { shouldEmitEvent: false, shouldGizmoUpdate: false })
      }

      CommandManager.instance.updateTransformRoots()
    }
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.duplicatedObjects, { deselectObject: false })
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `DuplicateMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} parent: ${serializeObject3D(this.parent)} before: ${serializeObject3D(this.before)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }
}
