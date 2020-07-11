// Handles the mapping of actions to state/blendspaces (weighted state groups)
// Uses an action state table
import { System, Entity } from "ecsy"
import StateHandler from "../components/StateHandler"
import Blendspace2D from "../components/Blendspace2D"
import StateBehaviorMap from "../interfaces/StateBehaviorMap"
import StateTransformation from "../components/StateTransformation"
import StateValue from "../interfaces/StateValue"
import BlendspaceValue from "../interfaces/BlendspaceValue"
import { Vector2 } from "../../common/types/NumericalTypes"

export default class StateSystem extends System {
  private _stateHandler: StateHandler
  private _blendspaceHandler: Blendspace2D
  private _stateTransformationData: StateBehaviorMap
  private _args: any
  public execute(delta: number, time: number): void {
    // Execute me
    console.log("ActionStateSystem")
    this.queries.stateHandlers.changed.forEach(entity => {
      this.makeTransformationsFromState(entity, delta)
    })

    this.queries.blendspaceHandlers.changed.forEach(entity => {
      this.makeTransformationsFromBlendspaces(entity, delta)
    })
  }

  private makeTransformationsFromState(entity: Entity, delta: number) {
    this._stateHandler = entity.getComponent(StateHandler)
    this._stateTransformationData = entity.getComponent(StateTransformation).data

    this._stateHandler.values.toArray().forEach((stateValue: StateValue) => {
      if (this._stateTransformationData.blendspaces[stateValue.state] !== undefined) {
        this._args = { entityIn: entity, ...this._stateTransformationData.blendspaces[stateValue.state].args }
        Function.call(this._stateTransformationData.blendspaces[stateValue.state].behavior, this._args, delta)
      }
    })
  }

  private makeTransformationsFromBlendspaces(entity: Entity, delta: number) {
    this._blendspaceHandler = entity.getComponent(Blendspace2D)
    this._stateTransformationData = entity.getComponent(StateTransformation).data

    this._blendspaceHandler.values.toArray().forEach((blendspaceValue: BlendspaceValue<Vector2>) => {
      if (this._stateTransformationData.blendspaces[blendspaceValue.type] !== undefined) {
        this._args = { entityIn: entity, ...this._stateTransformationData.blendspaces[blendspaceValue.type].args }
        Function.call(this._stateTransformationData.blendspaces[blendspaceValue.type].behavior, this._args, delta)
      }
    })
  }
}

StateSystem.queries = {
  stateHandlers: {
    components: [StateHandler],
    listen: { changed: true }
  },
  blendspaceHandlers: {
    components: [Blendspace2D],
    listen: { changed: true }
  }
}
