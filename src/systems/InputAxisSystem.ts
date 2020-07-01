import { System, Not } from "ecsy"
import UserInput from "../components/UserInput"
import InputAxisHandler from "../components/InputAxisHandler"
import InputReceiver from "../components/InputReceiver"

export default class InputAxisSystem extends System {
  // Temp variables
  private _userInputAxisQueue: InputAxisHandler

  public execute(): void {
    this.queries.userInputAxisQueue.added?.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(InputAxisHandler)
    })
    // If the queue hasn't been set yet, or the queue length is 0
    if (!this._userInputAxisQueue || this._userInputAxisQueue.queue.getSize() < 1) return
    this.queries.axisReceivers.results.forEach(entity => {
      entity.getComponent(InputAxisHandler).queue.clear()
      this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(InputAxisHandler))
    })
    // Clear all axis
    this._userInputAxisQueue.queue.clear()
  }

  private applyInputToListener(userInputAxisQueue: InputAxisHandler, listenerAxisQueue: InputAxisHandler): void {
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
    components: [UserInput, InputAxisHandler]
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler]
  }
}
