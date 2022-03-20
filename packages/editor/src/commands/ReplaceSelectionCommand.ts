import { store } from '@xrengine/client-core/src/store'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { addComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'

import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export default class ReplaceSelectionCommand extends Command {
  constructor(objects: EntityTreeNode[], params: CommandParams) {
    super(objects, params)

    if (this.keepHistory) this.oldSelection = accessSelectionState().selectedEntities.value.slice(0)
  }

  execute() {
    this.emitBeforeExecuteEvent()
    this.replaceSelection(this.affectedObjects)
    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldSelection) return

    this.emitBeforeExecuteEvent()
    this.replaceSelection(getEntityNodeArrayFromEntities(this.oldSelection))
    this.emitAfterExecuteEvent()
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

  replaceSelection(objects: EntityTreeNode[]): void {
    // Check whether selection is changed or not
    const selectedEntities = accessSelectionState().selectedEntities.value.slice(0)

    if (objects.length === selectedEntities.length) {
      let isSame = true

      for (let i = 0; i < objects.length; i++) {
        if (!selectedEntities.includes(objects[i].entity)) {
          isSame = false
          break
        }
      }

      if (isSame) return
    }

    // Fire deselect event for old objects
    for (let i = 0; i < selectedEntities.length; i++) {
      const entity = selectedEntities[i]
      let includes = false

      for (const object of objects) {
        if (object.entity === entity) {
          includes = true
          break
        }
      }

      if (!includes) {
        removeComponent(entity, SelectTagComponent)
      }
    }

    const newlySelectedEntities = [] as Entity[]

    // Replace selection with new objects and fire select event
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      newlySelectedEntities.push(object.entity)

      if (!hasComponent(object.entity, SelectTagComponent)) {
        addComponent(object.entity, SelectTagComponent, {})
      }
    }

    store.dispatch(SelectionAction.updateSelection(newlySelectedEntities))
  }
}
