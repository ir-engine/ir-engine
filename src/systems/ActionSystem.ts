import { System, Not } from "ecsy"
import InputActionQueue from "../components/InputActionQueue"
import Input from "../components/Input"
import InputReceiver from "../components/InputReceiver"

import { ActionMap } from "../maps/ActionMap"
import ActionValue from "../interfaces/ActionValue"
import InputActionMapData from "../components/InputActionMapData"
import ActionType from "../enums/InputActionType"

export default class ActionSystem extends System {
  // Temp variables
  private _userInputActionQueue: InputActionQueue
  private _actionMap = ActionMap
  private _skip: boolean

  public execute(): void {
    this.queries.actionMapData.added.forEach(entity => {
      this._actionMap = entity.getComponent(InputActionMapData).actionMap
    })
    this.queries.userInputActionQueue.changed.forEach(input => {
      this._userInputActionQueue = input.getMutableComponent(InputActionQueue)
      this.queries.actionReceivers.results.forEach(receiver => {
        receiver.getComponent(InputActionQueue).actions.clear()
        this.applyInputToListener(this._userInputActionQueue, receiver.getMutableComponent(InputActionQueue))
      })
    })
    // Clear all actions
    if (this._userInputActionQueue) this._userInputActionQueue.actions.clear()
  }

  private validateActions(actionQueue: InputActionQueue): void {
    if (!this._actionMap) return
    const actionQueueArray = actionQueue.actions.toArray()
    for (let i = 0; i < actionQueueArray.length; i++) {
      for (let k = 0; k < actionQueueArray.length; k++) {
        if (i == k) continue // don't compare to self

        // Opposing actions cancel out
        if (this.actionsOpposeEachOther(actionQueueArray, i, k)) {
          actionQueue.actions.remove(i)
          actionQueue.actions.remove(k)
        }

        // If action is blocked by another action that overrides and is active, remove this action
        else if (this.actionIsBlockedByAnother(actionQueueArray, i, k)) {
          actionQueue.actions.remove(i)
        }
        // Override actions override
        else if (this.actionOverridesAnother(actionQueueArray, i, k)) {
          actionQueue.actions.remove(k)
        }
      }
    }
  }

  // If they oppose, cancel them
  private actionsOpposeEachOther(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this._actionMap[actionToTest.action].opposes.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true
      }
    })
    return false
  }

  private actionIsBlockedByAnother(
    actionQueueArray: ActionValue[],
    arrayPosOne: number,
    arrayPoseTwo: number
  ): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this._actionMap[actionToTest.action].blockedBy.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true
      }
    })
    return false
  }

  private actionOverridesAnother(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this._actionMap[actionToTest.action].overrides.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        return true
      }
    })
    return false
  }

  private applyInputToListener(userInputActionQueue: InputActionQueue, listenerActionQueue: InputActionQueue) {
    // If action exists, but action state is different, update action state
    userInputActionQueue.actions.toArray().forEach(userInput => {
      this._skip = false
      listenerActionQueue.actions.toArray().forEach((listenerAction, listenerIndex) => {
        // Skip action since it's already in the listener queue
        if (userInput.action === listenerAction.action && userInput.value === listenerAction.value) {
          this._skip = true
        } else if (
          userInput.action === listenerAction.action &&
          userInput.value !== listenerAction.value &&
          userInput.value !== undefined
        ) {
          listenerActionQueue.actions.remove(listenerIndex)
          listenerActionQueue.actions.add(userInput)
          this._skip = true
        }
      })
      if (!this._skip) listenerActionQueue.actions.add(userInput)
    })
    // If action exists, but action state is same, do nothing
    this.validateActions(listenerActionQueue)
  }
}

ActionSystem.queries = {
  userInputActionQueue: {
    components: [InputActionQueue, Input],
    listen: { added: true, changed: true }
  },
  actionReceivers: {
    components: [InputActionQueue, InputReceiver, Not(Input)]
  },
  actionMapData: {
    components: [InputActionMapData, Input],
    listen: { added: true }
  }
}
