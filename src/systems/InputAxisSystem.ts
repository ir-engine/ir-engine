import { System, Not } from "ecsy"
import UserInput from "../components/UserInput"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import InputReceiver from "../components/InputReceiver"

export default class InputAxisSystem extends System {
  // Temp variables
  private _userInputAxisQueue: InputAxisHandler2D

  public execute(): void {
    this.queries.userInputAxisQueue.added?.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(InputAxisHandler2D)
    })
    // If the queue hasn't been set yet, or the queue length is 0
    if (!this._userInputAxisQueue || this._userInputAxisQueue.queue.getBufferLength() < 1) return
    this.queries.axisReceivers.results.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).queue.getBufferLength() > 0)
        entity.getMutableComponent(InputAxisHandler2D).queue.clear()
      if (this._userInputAxisQueue.queue.getBufferLength() > 0)
        this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(InputAxisHandler2D))
    })
    // Clear all axis
    this._userInputAxisQueue.queue.clear()
  }

  private applyInputToListener(userInputAxisQueue: InputAxisHandler2D, listenerAxisQueue: InputAxisHandler2D): void {
    // If axis exists, but axis state is different, update axis state
    userInputAxisQueue.queue.toArray().forEach(userInput => {
      let skip = false
      listenerAxisQueue.queue.toArray().forEach((listenerAxis, listenerIndex) => {
        // Skip axis since it's already in the listener queue
        if (userInput.axis === listenerAxis.axis && userInput.value === listenerAxis.value) {
          skip = true
        } else if (userInput.axis === listenerAxis.axis && userInput.value !== listenerAxis.value) {
          // Axis value updated, so skip ading to queue
          listenerAxisQueue.queue.get(listenerIndex).value = userInput.value
          skip = true
        }
      })
      if (!skip) listenerAxisQueue.queue.add(userInput)
    })
  }
}

InputAxisSystem.queries = {
  userInputAxisQueue: {
    components: [UserInput, InputAxisHandler2D]
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler2D]
  }
}
