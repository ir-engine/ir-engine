import { System, Entity } from "ecsy"
import State from "../components/State"
import StateValue from "../interfaces/StateValue"
import { Vector2, NumericalType } from "../../common/types/NumericalTypes"
import Behavior from "../../common/interfaces/Behavior"
import StateSchema from "../interfaces/StateSchema"
import StateGroupAlias from "../types/StateGroupAlias"
import { addState } from "../behaviors/StateBehaviors"
import LifecycleValue from "../../common/enums/LifecycleValue"

export default class StateSystem extends System {
  private _state: State
  private _args: any
  public execute(delta: number, time: number): void {
    this.queries.state.added?.forEach(entity => {
      // If stategroup has a default, add it to our state map
      this._state = entity.getComponent(State)
      if (this._state.schema === undefined) return
      Object.keys((this._state.schema as StateSchema)?.groups).forEach((stateGroup: StateGroupAlias) => {
        if (this._state.schema.groups[stateGroup] !== undefined && this._state.schema.groups[stateGroup].default !== undefined) {
          addState(entity, { state: this._state.schema.groups[stateGroup].default })
          console.log("Added default state: " + this._state.schema.groups[stateGroup].default)
        }
      })
    })

    this.queries.state.changed?.forEach(entity => {
      // If stategroup has a default, add it to our state map
      this._state = entity.getComponent(State)
      if (this._state.schema === undefined) return
      Object.keys((this._state.schema as StateSchema)?.groups).forEach((stateGroup: StateGroupAlias) => {
        if (this._state.schema.groups[stateGroup] !== undefined && this._state.schema.groups[stateGroup].default !== undefined) {
          addState(entity, { state: this._state.schema.groups[stateGroup].default })
          console.log("Added default state: " + this._state.schema.groups[stateGroup].default)
        }
      })
    })

    this.queries.state.results?.forEach(entity => {
      this.callBehaviors(entity, { phase: "onUpdate" }, delta)
      this.callBehaviors(entity, { phase: "onLateUpdate" }, delta)
    })
  }

  private callBehaviors: Behavior = (entity: Entity, args: { phase: string }, delta: number) => {
    this._state = entity.getComponent(State)
    this._state.data.forEach((stateValue: StateValue<NumericalType>) => {
      if (this._state.schema.states[stateValue.state] !== undefined && this._state.schema.states[stateValue.state][args.phase] !== undefined) {
        if (stateValue.lifecycleState === LifecycleValue.STARTED) {
          this._state.data.set(stateValue.state, {
            ...stateValue,
            lifecycleState: LifecycleValue.CONTINUED
          })
        }
        this._state.schema.states[stateValue.state][args.phase].behavior(entity, this._state.schema.states[stateValue.state][args.phase].args, delta)
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
