import { System, Entity } from "ecsy"
import InputReceiver from "../components/InputReceiver"
import UserInput from "../components/UserInput"
import ActionValue from "../interfaces/ActionValue"
import ActionType from "../types/ActionType"
import InputActionHandler from "../components/InputActionHandler"

export default class InputActionSystem extends System {
  // Temp variables
  private _userInputActionQueue: InputActionHandler
  private _skip: boolean
  private _userInput: UserInput

  public execute(): void {
    this.queries.userInputActionQueue.added.forEach(input => {
      this._userInputActionQueue = input.getComponent(InputActionHandler)
      this._userInput = input.getComponent(UserInput)
    })

    if (this._userInputActionQueue.values.getBufferLength() < 1) return
    this.queries.actionReceivers.results.forEach(receiver => {
      if (receiver.getComponent(InputActionHandler).values.getBufferLength() > 0) {
        receiver.getMutableComponent(InputActionHandler).values.clear()
      }
      this.applyInputToListener(this._userInputActionQueue, receiver)
    })
    this._userInputActionQueue.values.clear()
  }

  private validateActions(actionHandler: Entity): void {
    const actionQueueArray = actionHandler.getComponent(InputActionHandler).values.toArray()
    for (let i = 0; i < actionQueueArray.length; i++) {
      for (let k = 0; k < actionQueueArray.length; k++) {
        if (i == k) continue // don't compare to self

        // Opposing actions cancel out
        if (this.actionsOpposeEachOther(actionQueueArray, i, k)) {
          actionHandler.getMutableComponent(InputActionHandler).values.remove(i)
          actionHandler.getMutableComponent(InputActionHandler).values.remove(k)
        }
        // If action is blocked by another action that overrides and is active, remove this action
        else if (this.actionIsBlockedByAnother(actionQueueArray, i, k)) {
          actionHandler.getMutableComponent(InputActionHandler).values.remove(i)
        }
        // Override actions override
        else if (this.actionOverridesAnother(actionQueueArray, i, k)) {
          actionHandler.getMutableComponent(InputActionHandler).values.remove(k)
        }
      }
    }
  }

  // If they oppose, cancel them
  private actionsOpposeEachOther(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this._userInput.inputMap[actionToTest.action]?.opposes?.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true
      }
    })
    return false
  }

  private actionIsBlockedByAnother(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this._userInput.inputMap[actionToTest.action]?.blockedBy?.forEach((action: ActionType) => {
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
    this._userInput.inputMap[actionToTest.action]?.overrides?.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        return true
      }
    })
    return false
  }

  private applyInputToListener(userInputActionQueue: InputActionHandler, listenerActionQueue: Entity) {
    // If action exists, but action state is different, update action InputActionHandler
    userInputActionQueue.values.toArray().forEach(userInput => {
      this._skip = false
      listenerActionQueue
        .getComponent(InputActionHandler)
        .values.toArray()
        .forEach((listenerAction, listenerIndex) => {
          // Skip action since it's already in the listener queue
          if (userInput.action === listenerAction.action && userInput.value === listenerAction.value) {
            this._skip = true
          } else if (userInput.action === listenerAction.action && userInput.value !== listenerAction.value && userInput.value !== undefined) {
            listenerActionQueue.getMutableComponent(InputActionHandler).values.remove(listenerIndex)
            listenerActionQueue.getMutableComponent(InputActionHandler).values.add(userInput)
            this._skip = true
          }
        })
      if (!this._skip) {
        listenerActionQueue.getMutableComponent(InputActionHandler).values.add(userInput)
      }
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
  }
}
