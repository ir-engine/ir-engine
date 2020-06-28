import { System, Not } from "ecsy"
import AxisQueue from "../components/AxisQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

export default class AxisDebugSystem extends System {
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log(entity.getComponent(AxisQueue).axes.toArray())
    })
  }
}

AxisDebugSystem.queries = {
  actionReceivers: {
    components: [AxisQueue, UserInputReceiver, Not(Input)],
    listen: { changed: true }
  }
}
