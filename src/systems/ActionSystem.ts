import { System, Not } from "ecsy"
import ActionQueue from "../components/ActionQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

import ActionMap from "../maps/ActionMap"
import ActionValues from "../enums/ActionValues"
import ActionValue from "../interfaces/ActionValue"

export default class ActionSystem extends System {
  userInputActionQueue: ActionQueue
  execute(): void {
    this.queries.userInputActionQueue.results.forEach(entity => {
      this.userInputActionQueue = entity.getMutableComponent(ActionQueue)
      this.validateActions(this.userInputActionQueue)
    })
    this.queries.actionReceivers.results.forEach(entity => {
      this.applyInputToListener(
        this.userInputActionQueue,
        entity.getMutableComponent(ActionQueue)
      )
    })
    // Clear all actions
    this.userInputActionQueue.actions.clear()
  }

  validateActions(actionQueue: ActionQueue): void {
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
        // Override actions override
      }
    }
  }

  // If they oppose, cancel them
  actionsOpposeEachOther(actionQueueArray: ActionValue[], arrayPosOne, arrayPoseTwo): bool {
    const actionToTest = actionQueueArray[arrayPosOne].action
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo].action
    
  }

  applyInputToListener(
    userInputActionQueue: ActionQueue,
    listenerActionQueue: ActionQueue
  ) {
    // If action exists, but action state is different, update action state
    userInputActionQueue.actions.toArray().forEach(userInput => {
      listenerActionQueue.actions.toArray().forEach(listenerAction => {
        
      });
    });
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
  }
}
