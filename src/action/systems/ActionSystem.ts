import { System, Entity } from "ecsy"
import StateHandler from "../../state/components/StateHandler"
import Action from "../components/Action"
import Blendspace2D from "../../state/components/Blendspace2D"
import ActionStateData from "../interfaces/ActionData"
import InputActionHandler from "../../action/components/InputActionHandler"
import InputAxisHandler2D from "../../action/components/InputAxisHandler2D"
import ActionValue from "../interfaces/ActionValue"
import AxisValue from "../interfaces/AxisValue"
import { Vector2 } from "../../common/types/NumericalTypes"

export default class ActionSystem extends System {
  private _actionStateData: ActionStateData
  private _inputActionHandler: InputActionHandler
  private _inputAxisHandler: InputAxisHandler2D

  private _args: any
  public execute(delta: number, time: number): void {
    this.queries.actionStateComponents.results.forEach(entity => {
      this.mapActionsToState(entity, delta)
    })

    this.queries.axisBlendspaceComponents.results.forEach(entity => {
      this.mapAxisToState(entity, delta)
    })
  }

  private mapActionsToState(entity: Entity, delta: number) {
    this._inputActionHandler = entity.getComponent(InputActionHandler)
    this._actionStateData = entity.getComponent(Action).data

    this._inputActionHandler.values.toArray().forEach((actionValue: ActionValue) => {
      console.log("action value: ")
      console.log(actionValue)
      if (
        this._actionStateData.actions[actionValue.action] !== undefined &&
        this._actionStateData.actions[actionValue.action][actionValue.value] !== undefined
      ) {
        this._args = { entityIn: entity, ...this._actionStateData.actions[actionValue.action][actionValue.value].args }
        Function.call(this._actionStateData.actions[actionValue.action][actionValue.value].behavior, this._args, delta)
      }
    })
  }

  private mapAxisToState(entity: Entity, delta: number) {
    this._inputAxisHandler = entity.getComponent(InputAxisHandler2D)
    this._actionStateData = entity.getComponent(Action).data
    this._inputAxisHandler.values.toArray().forEach((axisValue: AxisValue<Vector2>) => {
      console.log("Axis: ")
      console.log(this._actionStateData.axes[axisValue.axis])
      if (this._actionStateData.axes[axisValue.axis] !== undefined) {
        this._args = { entityIn: entity, delta, ...{ args: this._actionStateData.axes[axisValue.axis].args ?? {} } }
        console.log(this._args)
        this._actionStateData.axes[axisValue.axis].behavior.call(this._args)
      }
    })
  }
}
ActionSystem.queries = {
  actionStateComponents: {
    components: [Action, StateHandler, InputActionHandler]
  },
  axisBlendspaceComponents: {
    components: [Action, Blendspace2D, InputActionHandler]
  }
}
