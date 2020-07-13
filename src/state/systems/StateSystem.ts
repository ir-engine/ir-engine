import { System, Entity } from "ecsy"
import State from "../components/State"
import StateValue from "../interfaces/StateValue"
import { Vector2 } from "../../common/types/NumericalTypes"
import Behavior from "../../common/interfaces/Behavior"

export default class StateSystem extends System {
  private _state: State
  private _args: any
  public execute(delta: number, time: number): void {
    this.queries.state.added?.forEach(entity => {
      this.callBehaviorsForHook(entity, { hook: "onAdded" }, delta)
    })

    this.queries.state.changed?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onChanged" }, delta)
    })

    this.queries.state.results?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onUpdate" }, delta)
      this.callBehaviorsForHook(entity, { phase: "onLateUpdate" }, delta)
    })

    this.queries.state.removed?.forEach(entity => {
      this.callBehaviorsForHook(entity, { phase: "onRemoved" }, delta)
    })
  }

  private callBehaviorsForHook: Behavior = (entityIn: Entity, args: { hook: string }, delta: number) => {
    this._state = entityIn.getComponent(State)
    this._state.data.forEach((stateValue: StateValue<Vector2>) => {
      if (this._state.map.states[stateValue.type] !== undefined && this._state.map.states[stateValue.type][args.hook] !== undefined) {
        this._args = { entityIn: entityIn, ...this._state.map.states[stateValue.type][args.hook].args }
        Function.call(this._state.map.states[stateValue.type][args.hook].behavior, this._args, delta)
      }
    })
  }
}

StateSystem.queries = {
  state: {
    components: [State],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  }
}
