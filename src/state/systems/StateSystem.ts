// Handles the mapping of axes to state/states (weighted state groups)
// Uses an axis state table
import { System, Entity } from "ecsy"
import StateHandler from "../components/StateHandler"
import State2D from "../components/State2D"
import StateData from "../interfaces/StateData"
import StateTransformation from "../components/StateTransformation"
import StateValue from "../interfaces/StateValue"
import StateValue from "../interfaces/StateValue"
import { Vector2 } from "../../common/types/NumericalTypes"

export default class StateSystem extends System {
  private _stateHandler: StateHandler
  private _stateHandler: State2D
  private _stateTransformationData: StateData
  private _args: any
  public execute(delta: number, time: number): void {
    // Execute me
    console.log("ActionStateSystem")
    this.queries.stateHandlers.changed.forEach(entity => {
      this.makeTransformationsFromState(entity, delta)
    })

    this.queries.stateHandlers.changed.forEach(entity => {
      this.makeTransformationsFromStates(entity, delta)
    })
  }

  private makeTransformationsFromState(entity: Entity, delta: number) {
    this._stateHandler = entity.getComponent(StateHandler)
    this._stateTransformationData = entity.getComponent(StateTransformation).data

    this._stateHandler.values.toArray().forEach((stateValue: StateValue) => {
      if (this._stateTransformationData.states[stateValue.state] !== undefined) {
        this._args = { entityIn: entity, ...this._stateTransformationData.states[stateValue.state].args }
        Function.call(this._stateTransformationData.states[stateValue.state].behavior, this._args, delta)
      }
    })
  }

  private makeTransformationsFromStates(entity: Entity, delta: number) {
    this._stateHandler = entity.getComponent(State2D)
    this._stateTransformationData = entity.getComponent(StateTransformation).data

    this._stateHandler.values.toArray().forEach((stateValue: StateValue<Vector2>) => {
      if (this._stateTransformationData.states[stateValue.type] !== undefined) {
        this._args = { entityIn: entity, ...this._stateTransformationData.states[stateValue.type].args }
        Function.call(this._stateTransformationData.states[stateValue.type].behavior, this._args, delta)
      }
    })
  }
}

StateSystem.queries = {
  stateHandlers: {
    components: [StateHandler],
    listen: { changed: true }
  },
  stateHandlers: {
    components: [State2D],
    listen: { changed: true }
  }
}
