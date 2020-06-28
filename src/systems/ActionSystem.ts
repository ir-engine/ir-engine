import { System, Not } from "ecsy"
import ActionQueue from "../components/ActionQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

import { ActionMap } from "../maps/ActionMap"
import ActionValue from "../interfaces/ActionValue"
import ActionMapData from "../components/ActionMapData"
import ActionType from "../enums/ActionType"

export default class ActionSystem extends System {
  userInputActionQueue: ActionQueue
  actionMap = ActionMap

  execute(): void {
    this.queries.actionMapData.added.forEach(entity => {
      this.actionMap = entity.getComponent(ActionMapData).actionMap
    })
    this.queries.userInputActionQueue.results.forEach(entity => {
      this.userInputActionQueue = entity.getMutableComponent(ActionQueue)
      this.validateActions(this.userInputActionQueue)
    })
    this.queries.actionReceivers.results.forEach(entity => {
      this.applyInputToListener(this.userInputActionQueue, entity.getMutableComponent(ActionQueue))
    })
    // Clear all actions
    this.userInputActionQueue.actions.clear()
  }

  validateActions(actionQueue: ActionQueue): void {
    if (!this.actionMap) return
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
  actionsOpposeEachOther(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this.actionMap[actionToTest.action].opposes.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true
      }
    })
    return false
  }

  actionIsBlockedByAnother(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this.actionMap[actionToTest.action].blockedBy.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true
      }
    })
    return false
  }

  actionOverridesAnother(actionQueueArray: ActionValue[], arrayPosOne: number, arrayPoseTwo: number): boolean {
    const actionToTest = actionQueueArray[arrayPosOne]
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo]
    this.actionMap[actionToTest.action].overrides.forEach((action: ActionType) => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        return true
      }
    })
    return false
  }

  applyInputToListener(userInputActionQueue: ActionQueue, listenerActionQueue: ActionQueue) {
    // If action exists, but action state is different, update action state
    userInputActionQueue.actions.toArray().forEach(userInput => {
      listenerActionQueue.actions.toArray().forEach(listenerAction => {
        
      })
    })
    // If action exists, but action state is same, do nothing
    this.validateActions(listenerActionQueue)
  }
}

ActionSystem.queries = {
  userInputActionQueue: {
    components: [ActionQueue, Input]
  },
  actionReceivers: {
    components: [ActionQueue, UserInputReceiver, Not(Input)]
  },
  actionMapData: {
    components: [ActionMapData, Input],
    listen: { added: true }
  }
}
