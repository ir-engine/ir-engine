import { System } from "ecsy"
import Axis from "../components/Axis"
import { handleButtonAxes } from "../behaviors/handleButtonAxes"
import { handleContinuousAxes } from "../behaviors/handleContinuousAxes"

export default class AxisSystem extends System {
  public execute(delta: number, time: number): void {
    this.queries.actionStateComponents.results.forEach(entity => {
      handleButtonAxes(entity, delta)
    })

    this.queries.axisStateComponents.results.forEach(entity => {
      handleContinuousAxes(entity, delta)
    })
  }
}
AxisSystem.queries = {
  actionStateComponents: {
    components: [Axis]
  }
}
