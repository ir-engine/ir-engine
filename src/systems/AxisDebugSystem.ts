import { System, Not } from "ecsy"
import InputAxisQueue from "../components/InputAxisQueue"
import Input from "../components/Input"
import InputReceiver from "../components/InputReceiver"

export default class AxisDebugSystem extends System {
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log("AxisDebugSystem: ")
      console.log(entity.getComponent(InputAxisQueue).axes.toArray())
    })
  }
}

AxisDebugSystem.queries = {
  actionReceivers: {
    components: [InputAxisQueue, InputReceiver, Not(Input)],
    listen: { changed: true }
  }
}
