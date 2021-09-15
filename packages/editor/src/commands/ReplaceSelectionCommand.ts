import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'

export default class ReplaceSelectionCommand extends Command {
  constructor(objects?: any | any[], params?: CommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.oldSelection = CommandManager.instance.selected.slice(0)
  }

  execute() {
    this.emitBeforeExecuteEvent()

    // Check whether selection is changed or not
    if (this.affectedObjects.length === CommandManager.instance.selected.length) {
      let isSame = true

      for (let i = 0; i < this.affectedObjects.length; i++) {
        if (!CommandManager.instance.selected.includes(this.affectedObjects[i])) {
          isSame = false
          break
        }
      }

      if (isSame) return
    }

    const prevSelected = CommandManager.instance.selected.slice(0)

    // Fire deselect event for old objects
    for (let i = 0; i < prevSelected.length; i++) {
      const object = CommandManager.instance.selected[i]

      if (object.isNode && this.affectedObjects.indexOf(object) > -1) {
        object.onDeselect()
      }
    }

    CommandManager.instance.selected = []

    // Replace selection with new objects and fire select event
    for (let i = 0; i < this.affectedObjects.length; i++) {
      const object = this.affectedObjects[i]

      CommandManager.instance.selected.push(object)

      if (object.isNode && prevSelected.indexOf(object) === -1) {
        object.onSelect()
      }
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `SelectMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent) CommandManager.instance.emitEvent(EditorEvents.BEFORE_SELECTION_CHANGED)
  }
}
