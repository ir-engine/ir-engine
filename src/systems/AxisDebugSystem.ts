import { System, Not } from "ecsy"
import AxisQueue from "../components/AxisQueue"
import Input from "../components/Input"
import InputReceiver from "../components/InputReceiver"

export default class AxisDebugSystem extends System {
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log("AxisDebugSystem: ")
      console.log(entity.getComponent(AxisQueue).axes.toArray())
    })
  }
}

AxisDebugSystem.queries = {
  actionReceivers: {
    components: [AxisQueue, InputReceiver, Not(Input)],
    listen: { changed: true }
  }
}
