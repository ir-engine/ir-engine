import i18n from 'i18next'
import Command, { CommandParams } from './Command'
import { serializeObject3D } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import getDetachedObjectsRoots from '../functions/getDetachedObjectsRoots'
import makeUniqueName from '../functions/makeUniqueName'
import { NodeManager } from '../managers/NodeManager'
import { SceneManager } from '../managers/SceneManager'

export interface AddObjectCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: any

  /** Child object before which all objects will be added */
  befores?: any

  /** Whether to use unique name or not */
  useUniqueName?: boolean
}

export default class AddObjectCommand extends Command {
  /** Parent object which will hold objects being added by this command */
  parents: any

  /** Child object before which all objects will be added */
  befores: any

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  duplicateObjects?: any[]

  constructor(objects?: any | any[], params?: AddObjectCommandParams) {
    super(objects, params)

    this.affectedObjects = Array.isArray(objects) ? objects : [objects]
    this.parents = Array.isArray(params.parents) ? params.parents : [params.parents]
    this.befores = Array.isArray(params.befores) ? params.befores : [params.befores]
    this.useUniqueName = params.useUniqueName ?? true
    this.oldSelection = CommandManager.instance.selected.slice(0)
  }

  execute(): void {
    this.emitBeforeExecuteEvent()

    this.addObject(this.affectedObjects, this.parents, this.befores)

    this.emitAfterExecuteEvent()
  }

  undo(): void {
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.affectedObjects, {
      deselectObject: false
    })
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString(): string {
    return `AddObjectCommand id: ${this.id} object: ${serializeObject3D(
      this.affectedObjects
    )} parent: ${serializeObject3D(this.parents)} before: ${serializeObject3D(this.befores)}`
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

  addObject(objects: any[], parents: any[], befores: any[]): void {
    const rootObjects = getDetachedObjectsRoots(objects)

    for (let i = 0; i < rootObjects.length; i++) {
      const object = rootObjects[i]
      object.saveParent = true

      const parent = parents ? parents[i] ?? parents[0] : undefined
      const before = befores ? befores[i] ?? befores[0] : undefined

      if (parent) {
        if (before) {
          const index = parent.children.indexOf(before)

          if (index === -1) {
            throw new Error(i18n.t('editor:errors.addObject'))
          }

          parent.children.splice(index, 0, object)
          object.parent = parent
        } else {
          parent.add(object)
        }
      } else if (object !== SceneManager.instance.scene) {
        SceneManager.instance.scene.add(object)
      }

      object.traverse((child) => {
        if (child.isNode) {
          if (this.useUniqueName) {
            makeUniqueName(SceneManager.instance.scene, child)
          }

          child.onAdd()
          NodeManager.instance.add(child)
        }
      })

      object.updateMatrixWorld(true)
    }

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.affectedObjects, {
        shouldEmitEvent: false
      })
    }
  }
}
