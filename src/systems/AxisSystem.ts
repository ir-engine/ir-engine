import { System, Not } from "ecsy"
import AxisQueue from "../components/AxisQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

export default class AxisSystem extends System {
  // Temp variables
  private _userInputAxisQueue: AxisQueue

  public execute(): void {
    this.queries.userInputAxisQueue.results.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(AxisQueue)
    })
    this.queries.axisReceivers.results.forEach(entity => {
      this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(AxisQueue))
    })
    // Clear all axiss
    this._userInputAxisQueue.axes.clear()
  }

  private applyInputToListener(userInputAxisQueue: AxisQueue, listenerAxisQueue: AxisQueue): void {
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
    components: [AxisQueue, Input]
  },
  axisReceivers: {
    components: [AxisQueue, UserInputReceiver, Not(Input)]
  }
}
