import { System, Not } from "ecsy"
import ActionQueue from "../components/ActionQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

export default class ActionSystem extends System {
  userInputActionQueue: ActionQueue
  execute(): void {
    this.queries.userInputActionQueue.results.forEach(entity => {
      this.userInputActionQueue = entity.getComponent(ActionQueue)
      this.validateActions(this.userInputActionQueue)
    })
    this.queries.actionReceivers.results.forEach(entity => {
      this.applyInputToListener(
        this.userInputActionQueue,
        entity.getComponent(ActionQueue)
      )
    })
    // Clear all actions
    this.userInputActionQueue.actions.clear()
  }

  validateActions(actionQueue: ActionQueue): void {
    const actionQueueArray = actionQueue.actions.toArray()
    for (let i = 0; i < actionQueueArray.length; i++) {
      for (let k = 0; k < actionQueueArray.length; k++) {
        // Opposing actions cancel out
        actionQueue.actions.remove(i)

        // If action is blocked by another action that overrides and is active, remove this action
        // Override actions override
      }
    }
  }

  applyInputToListener(
    userInputActionQueue: ActionQueue,
    listenerActionQueue: ActionQueue
  ) {
    // If action exists, but action state is different, update action state
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
