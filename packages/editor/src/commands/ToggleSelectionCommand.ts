import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { addComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'

import { executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export default class ToggleSelectionCommand extends Command {
  constructor(objects: EntityTreeNode[], params: CommandParams) {
    super(objects, params)

    if (this.keepHistory) this.oldSelection = accessSelectionState().selectedEntities.value.slice(0)
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const selectedEntities = accessSelectionState().selectedEntities.value.slice(0)

    for (let i = 0; i < this.affectedObjects.length; i++) {
      const object = this.affectedObjects[i]
      let index = selectedEntities.indexOf(object.entity)

      if (index > -1) {
        selectedEntities.splice(index, 1)
        removeComponent(object.entity, SelectTagComponent)
      } else {
        addComponent(object.entity, SelectTagComponent, {})
        selectedEntities.push(object.entity)
      }
    }

    store.dispatch(SelectionAction.updateSelection(selectedEntities))

    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldSelection) return
    executeCommand(EditorCommands.REPLACE_SELECTION, getEntityNodeArrayFromEntities(this.oldSelection))
  }

  toString() {
    return `SelectMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      updateOutlinePassSelection()
    }
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent) {
      cancelGrabOrPlacement()
      store.dispatch(SelectionAction.changedBeforeSelection())
    }
  }
}
