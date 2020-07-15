import { System, Entity } from "ecsy"
import State from "../components/State"
import StateValue from "../interfaces/StateValue"
import { Vector2, NumericalType } from "../../common/types/NumericalTypes"
import Behavior from "../../common/interfaces/Behavior"
import { StateType } from "../enums/StateType"
import BinaryValue from "../../common/enums/BinaryValue"

export default class StateSystem extends System {
  private _state: State
  private _args: any
  public execute(delta: number, time: number): void {
    this.queries.state.added?.forEach(entity => {
      // Set default states is there is one
      this.callBehaviorsForPhase(entity, { phase: "onAdded" }, delta)
    })

    this.queries.state.changed?.forEach(entity => {
      this.callBehaviorsForPhase(entity, { phase: "onChanged" }, delta)
    })

    this.queries.state.results?.forEach(entity => {
      this.callBehaviorsForPhase(entity, { phase: "onUpdate" }, delta)
      this.callBehaviorsForPhase(entity, { phase: "onLateUpdate" }, delta)
    })

    this.queries.state.removed?.forEach(entity => {
      this.callBehaviorsForPhase(entity, { phase: "onRemoved" }, delta)
    })
  }

  private callBehaviorsForPhase: Behavior = (entity: Entity, args: { phase: string }, delta: number) => {
    this._state = entity.getComponent(State)
    this._state.data.forEach((stateValue: StateValue<NumericalType>) => {
      if (stateValue.type == StateType.DISCRETE && stateValue.value == BinaryValue.OFF) return
      if (this._state.map.states[stateValue.type] !== undefined && this._state.map.states[stateValue.type][args.phase] !== undefined) {
        this._state.map.states[stateValue.type][args.phase].behavior(entity, this._state.map.states[stateValue.type][args.phase].args, delta)
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
