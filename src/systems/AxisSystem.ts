import { System, Not } from "ecsy"
import InputAxisQueue from "../components/InputAxisQueue"
import Input from "../components/Input"
import InputReceiver from "../components/InputReceiver"

export default class AxisSystem extends System {
  // Temp variables
  private _userInputAxisQueue: InputAxisQueue

  public execute(): void {
    this.queries.userInputAxisQueue.results.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(InputAxisQueue)
    })
    // If the queue hasn't been set yet, or the queue length is 0
    if (this._userInputAxisQueue || this._userInputAxisQueue.axes.getSize() < 1) return
    this.queries.axisReceivers.results.forEach(entity => {
      entity.getComponent(InputAxisQueue).axes.clear()
      this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(InputAxisQueue))
    })
    // Clear all axis
    this._userInputAxisQueue.axes.clear()
  }

  private applyInputToListener(userInputAxisQueue: InputAxisQueue, listenerAxisQueue: InputAxisQueue): void {
    // If axis exists, but axis state is different, update axis state
    userInputAxisQueue.axes.toArray().forEach(userInput => {
      let skip = false
      listenerAxisQueue.axes.toArray().forEach((listenerAxis, listenerIndex) => {
        // Skip axis since it's already in the listener queue
        if (userInput.axis === listenerAxis.axis && userInput.value === listenerAxis.value) {
          skip = true
        } else if (userInput.axis === listenerAxis.axis && userInput.value !== listenerAxis.value) {
          // Axis value updated, so skip ading to queue
          listenerAxisQueue.axes.get(listenerIndex).value = userInput.value
          skip = true
        }
      })
      if (!skip) listenerAxisQueue.axes.add(userInput)
    })
  }
}

AxisSystem.queries = {
  userInputAxisQueue: {
    components: [InputAxisQueue, Input]
  },
  axisReceivers: {
    components: [InputAxisQueue, InputReceiver, Not(Input)]
  }
}
