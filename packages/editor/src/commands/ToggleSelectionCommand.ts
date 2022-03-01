import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { addComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'

import EditorCommands from '../constants/EditorCommands'
import { serializeObject3DArray } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import { ControlManager } from '../managers/ControlManager'
import { SceneManager } from '../managers/SceneManager'
import { SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export default class ToggleSelectionCommand extends Command {
  constructor(objects: EntityTreeNode[], params: CommandParams) {
    super(objects, params)

    if (this.keepHistory) this.oldSelection = CommandManager.instance.selected.slice(0)
  }

  execute() {
    this.emitBeforeExecuteEvent()

    for (let i = 0; i < this.affectedObjects.length; i++) {
      const object = this.affectedObjects[i]
      const index = CommandManager.instance.selected.indexOf(object)

      if (index > -1) {
        CommandManager.instance.selected.splice(index, 1)
        removeComponent(object.entity, SelectTagComponent)
      } else {
        addComponent(object.entity, SelectTagComponent, {})
        CommandManager.instance.selected.push(object)
      }
    }

    if (this.shouldGizmoUpdate) {
      CommandManager.instance.updateTransformRoots()
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldSelection) return

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `SelectMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      ControlManager.instance.onSelectionChanged()
      SceneManager.instance.updateOutlinePassSelection()
      store.dispatch(SelectionAction.changedSelection())
    }
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent) {
      ControlManager.instance.onBeforeSelectionChanged()
      store.dispatch(SelectionAction.changedBeforeSelection())
    }
  }
}
