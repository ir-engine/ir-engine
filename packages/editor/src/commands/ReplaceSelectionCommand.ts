import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { addComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

export default class ReplaceSelectionCommand extends Command {
  constructor(objects: EntityTreeNode[], params: CommandParams) {
    super(objects, params)

    if (this.keepHistory) this.oldSelection = CommandManager.instance.selected.slice(0)
  }

  execute() {
    this.emitBeforeExecuteEvent()
    this.replaceSelection(this.affectedObjects)
    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldSelection) return

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

    // Fire deselect event for old objects
    for (let i = 0; i < CommandManager.instance.selected.length; i++) {
      const object = CommandManager.instance.selected[i]
      if (!objects.includes(object)) {
        removeComponent(object.entity, SelectTagComponent)
      }
    }

    CommandManager.instance.selected = []

    // Replace selection with new objects and fire select event
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      CommandManager.instance.selected.push(object)

      if (!hasComponent(object.entity, SelectTagComponent)) {
        addComponent(object.entity, SelectTagComponent, {})
      }
    }

    if (this.shouldGizmoUpdate) {
      CommandManager.instance.updateTransformRoots()
    }
  }
}
