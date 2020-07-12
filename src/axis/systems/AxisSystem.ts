import { System } from "ecsy"
import Axis from "../components/Axis"
import { Entity } from "ecsy"
import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import BinaryValue from "../../common/enums/BinaryValue"

export default class AxisSystem extends System {
  public execute(delta: number, time: number): void {
    this.queries.actionStateComponents.results.forEach(entity => {
      handleButtonAxes(entity)
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

let axisValue: any
let stateValueOut: any
let axis: Axis
// TODO: Fix (but after changing map over)
export const handleButtonAxes: Behavior = (entityIn: Entity, args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }): void => {
  // get axis component and set local reference
  axis = entityIn.getComponent(Axis)

  // get state and set with axis
  vec2.scale(stateValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  entityIn.getMutableComponent(Input).behaviorMap.buttonAxes[args.axis]


    .values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = stateValueOut
}



//  Behavior = (entityIn: Entity, args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }): void => {
function handleContinuousAxes(entity: Entity, delta: number) {
  this._inputAxisHandler = entity.getComponent(Axis)
  this._actionStateData = entity.getComponent(Axis).data
  this._inputAxisHandler.values.toArray().forEach((axisValue: AxisValue<Vector2>) => {
    console.log("Axis: ")
    console.log(this._actionStateData.axes[axisValue.axis])
    if (this._actionStateData.axes[axisValue.axis] !== undefined) {
      this._args = { entityIn: entity, delta, ...{ args: this._actionStateData.axes[axisValue.axis].args ?? {} } }
      this._actionStateData.axes[axisValue.axis].behavior.call(this._args)
    }
  })
}
