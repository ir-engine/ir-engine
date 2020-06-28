// TODO: Finish

import { System, Not } from "ecsy"
import AxisQueue from "../components/AxisQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

export default class AxisSystem extends System {
  userInputActionQueue: AxisQueue
  execute(): void {
    this.queries.userInputActionQueue.results.forEach(entity => {
      this.userInputActionQueue = entity.getMutableComponent(AxisQueue)
      this.validateAxes(this.userInputActionQueue)
    })
    this.queries.actionReceivers.results.forEach(entity => {
      this.applyInputToListener(
        this.userInputActionQueue,
        entity.getMutableComponent(AxisQueue)
      )
    })
    // Clear all actions
    this.userInputActionQueue.actions.clear()
  }

  validateAxes(actionQueue: AxisQueue): void {
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
    userInputActionQueue: AxisQueue,
    listenerActionQueue: AxisQueue
  ) {
    // If action exists, but action state is different, update action state
    // If action exists, but action state is same, do nothing
    this.validateAxes(listenerActionQueue)
  }
}

AxisSystem.queries = {
  userInputActionQueue: {
    components: [AxisQueue, Input]
  },
  actionReceivers: {
    components: [AxisQueue, UserInputReceiver, Not(Input)]
  }
}
