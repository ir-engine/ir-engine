import i18n from 'i18next'
import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { NodeManager } from '../managers/NodeManager'

export interface RemoveObjectCommandParams extends CommandParams {
  /** Whether to deselect object or not */
  deselectObject?: boolean
}

export default class RemoveObjectsCommand extends Command {
  oldParents: any[]

  oldBefores: any[]

  oldNodes: any

  deselectObject?: boolean

  constructor(objects?: any | any[], params?: RemoveObjectCommandParams) {
    super(objects, params)

    this.affectedObjects = []
    this.oldParents = []
    this.oldBefores = []
    this.oldNodes = NodeManager.instance.getCopy()
    this.oldSelection = CommandManager.instance.selected.slice(0)
    this.deselectObject = params.deselectObject

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    // Sort objects, parents, and befores with a depth first search so that undo adds nodes in the correct order
    useEngine().scene.traverse((object) => {
      if (objects.indexOf(object) !== -1) {
        this.affectedObjects.push(object)
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
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const removeObjectsRoots = []
    CommandManager.instance.getRootObjects(this.affectedObjects, removeObjectsRoots)

    for (let i = 0; i < removeObjectsRoots.length; i++) {
      const object = removeObjectsRoots[i]

      if (object.parent === null) return null // avoid deleting the camera or scene

      object.traverse((child) => {
        if (child.isNode) {
          child.onRemove()
          if (!NodeManager.instance.remove(child)) {
            throw new Error(i18n.t('editor:errors.removeObject'))
          }
        }
      })

      object.parent.remove(object)

      if (this.deselectObject) {
        CommandManager.instance.executeCommand(EditorCommands.REMOVE_FROM_SELECTION, object, {
          shouldEmitEvent: this.shouldEmitEvent
        })
      }
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.affectedObjects, {
      parents: this.oldParents,
      befores: this.oldBefores,
      isObjectSelected: this.isSelected,
      useUniqueName: false
    })

    NodeManager.instance.fill(this.oldNodes)

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `RemoveMultipleObjectsCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }
}
