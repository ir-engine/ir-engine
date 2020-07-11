import { System } from "ecsy"
import UserInput from "../components/UserInput"
import InputAxisHandler2D from "../../action/components/InputAxisHandler2D"
import InputReceiver from "../components/InputReceiver"

export default class InputAxisSystem extends System {
  // Temp variables
  private _userInputAxisQueue: InputAxisHandler2D

  public execute(): void {
    this.queries.userInputAxisQueue.added.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(InputAxisHandler2D)
    })
    // If the queue hasn't been set yet, or the queue length is 0
    if (!this._userInputAxisQueue || this._userInputAxisQueue.values.getBufferLength() < 1) {
      return
    }
    this.queries.axisReceivers.results.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).values.getBufferLength() > 0) {
        entity.getMutableComponent(InputAxisHandler2D).values.clear()
      }
      if (this._userInputAxisQueue.values.getBufferLength() > 0) {
        this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(InputAxisHandler2D))
      }
    })
    // Clear all axis
    this._userInputAxisQueue.values.clear()
  }

  private applyInputToListener(userInputAxisQueue: InputAxisHandler2D, listenerAxisQueue: InputAxisHandler2D): void {
    // If axis exists, but axis state is different, update axis state
    userInputAxisQueue.values.toArray().forEach(userInput => {
      let skip = false
      listenerAxisQueue.values.toArray().forEach((listenerAxis, listenerIndex) => {
        // Skip axis since it's already in the listener queue
        if (userInput.axis === listenerAxis.axis && userInput.value === listenerAxis.value) {
          skip = true
        } else if (userInput.axis === listenerAxis.axis && userInput.value !== listenerAxis.value) {
          // Axis value updated, so skip ading to queue
          listenerAxisQueue.values.get(listenerIndex).value = userInput.value
          skip = true
        }
      })
      if (!skip) listenerAxisQueue.values.add(userInput)
    })
  }
}

InputAxisSystem.queries = {
  userInputAxisQueue: {
    components: [UserInput, InputAxisHandler2D],
    listen: { added: true }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler2D]
  }
}
