import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { addComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

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
    this.replaceSelection(this.affectedObjects)
    this.emitAfterExecuteEvent()
  }

  undo() {
    this.emitBeforeExecuteEvent()
    this.replaceSelection(this.oldSelection)
    this.emitAfterExecuteEvent()
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

  replaceSelection(objects: EntityTreeNode[]): void {
    console.log(objects, CommandManager.instance.selected)
    // Check whether selection is changed or not
    if (objects.length === CommandManager.instance.selected.length) {
      let isSame = true

      for (let i = 0; i < objects.length; i++) {
        if (!CommandManager.instance.selected.includes(objects[i])) {
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

      if (object.isNode && !objects.includes(object)) {
        if (object.onDeselect) object.onDeselect()
      } else if (object.entity) {
        removeComponent(object.entity, SelectTagComponent)
      }
    }

    CommandManager.instance.selected = []

    // Replace selection with new objects and fire select event
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      CommandManager.instance.selected.push(object)

      if (!prevSelected.includes(object)) {
        if (object.isNode) {
          if (object.onSelect) object.onSelect()
        } else if (object.entity) {
          addComponent(object.entity, SelectTagComponent, {})
        }
      }
    }

    if (this.shouldGizmoUpdate) {
      CommandManager.instance.updateTransformRoots()
    }

    console.log(CommandManager.instance.selected)
  }
}
