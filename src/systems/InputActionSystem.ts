import { System } from "ecsy"
import InputReceiver from "../components/InputReceiver"
import UserInput from "../components/UserInput"
import { ActionMap } from "../defaults/DefaultActionMap"
import ActionValue from "../interfaces/ActionValue"
import InputActionMapData from "../components/InputActionMapData"
import ActionType from "../types/ActionType"
import InputActionHandler from "../components/InputActionHandler"

export default class InputActionSystem extends System {
  // Temp variables
  private _userInputActionQueue: InputActionHandler
  private _actionMap = ActionMap
  private _skip: boolean

  public execute(): void {
    this.queries.actionMapData.added.forEach(entity => {
      this._actionMap = entity.getComponent(InputActionMapData).actionMap
    })
    this.queries.userInputActionQueue.changed.forEach(input => {
      this._userInputActionQueue = input.getMutableComponent(InputActionHandler)
      this.queries.actionReceivers.results.forEach(receiver => {
        receiver.getComponent(InputActionHandler).queue.clear()
        this.applyInputToListener(this._userInputActionQueue, receiver.getMutableComponent(InputActionHandler))
      })
    })
    // Clear all actions
    if (this._userInputActionQueue) this._userInputActionQueue.queue.clear()
  }

  private validateActions(actionHandler: InputActionHandler): void {
    if (!this._actionMap) return
    const actionQueueArray = actionHandler.queue.toArray()
    for (let i = 0; i < actionQueueArray.length; i++) {
      for (let k = 0; k < actionQueueArray.length; k++) {
        if (i == k) continue // don't compare to self

        // Opposing actions cancel out
        if (this.actionsOpposeEachOther(actionQueueArray, i, k)) {
          actionHandler.queue.remove(i)
          actionHandler.queue.remove(k)
        }

        // If action is blocked by another action that overrides and is active, remove this action
        else if (this.actionIsBlockedByAnother(actionQueueArray, i, k)) {
          actionHandler.queue.remove(i)
        }
        // Override actions override
        else if (this.actionOverridesAnother(actionQueueArray, i, k)) {
          actionHandler.queue.remove(k)
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

  private applyInputToListener(userInputActionQueue: InputActionHandler, listenerActionQueue: InputActionHandler) {
    // If action exists, but action state is different, update action InputActionHandler
    userInputActionQueue.queue.toArray().forEach(userInput => {
      this._skip = false
      listenerActionQueue.queue.toArray().forEach((listenerAction, listenerIndex) => {
        // Skip action since it's already in the listener queue
        if (userInput.action === listenerAction.action && userInput.value === listenerAction.value) {
          this._skip = true
        } else if (
          userInput.action === listenerAction.action &&
          userInput.value !== listenerAction.value &&
          userInput.value !== undefined
        ) {
          listenerActionQueue.queue.remove(listenerIndex)
          listenerActionQueue.queue.add(userInput)
          this._skip = true
        }
      })
      if (!this._skip) listenerActionQueue.queue.add(userInput)
    })
    // If action exists, but action state is same, do nothing
    this.validateActions(listenerActionQueue)
  }
}

InputActionSystem.queries = {
  userInputActionQueue: {
    components: [UserInput, InputActionHandler],
    listen: { added: true, changed: true }
  },
  actionReceivers: {
    components: [InputReceiver, InputActionHandler]
  },
  actionMapData: {
    components: [InputActionMapData, UserInput],
    listen: { added: true }
  }
}
