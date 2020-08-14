import { LifecycleValue } from "../../common/enums/LifecycleValue"
import { Behavior } from "../../common/interfaces/Behavior"
import { NumericalType } from "../../common/types/NumericalTypes"
import { Entity } from "../../ecs/classes/Entity"
import { Attributes, System } from "../../ecs/classes/System"
import { addState } from "../behaviors/StateBehaviors"
import { State } from "../components/State"
import { StateSchema } from "../interfaces/StateSchema"
import { StateValue } from "../interfaces/StateValue"
import { StateGroupAlias } from "../types/StateGroupAlias"
import { registerComponent, getComponent } from "../../ecs"

export class StateSystem extends System {
  init(): void {
    registerComponent(State)
  }
  private _state: State
  private _args: any
  public execute(delta: number, time: number): void {
    this.queries.state.added?.forEach(entity => {
      // If stategroup has a default, add it to our state map
      this._state = getComponent(entity, State)
      if (this._state.schema === undefined) return
      Object.keys((this._state.schema as StateSchema)?.groups).forEach((stateGroup: StateGroupAlias) => {
        if (
          this._state.schema.groups[stateGroup] !== undefined &&
          this._state.schema.groups[stateGroup].default !== undefined
        ) {
          addState(entity, { state: this._state.schema.groups[stateGroup].default })
        }
      })
    })

    this.queries.state.changed?.forEach(entity => {
      // If stategroup has a default, add it to our state map
      this._state = getComponent(entity, State)
      if (this._state.schema === undefined) return
      Object.keys((this._state.schema as StateSchema)?.groups).forEach((stateGroup: StateGroupAlias) => {
        if (
          this._state.schema.groups[stateGroup] !== undefined &&
          this._state.schema.groups[stateGroup].default !== undefined
        ) {
          addState(entity, { state: this._state.schema.groups[stateGroup].default })
        }
      })
    })

    this.queries.state.results?.forEach(entity => {
      this.callBehaviors(entity, { phase: "onUpdate" }, delta)
      this.callBehaviors(entity, { phase: "onLateUpdate" }, delta)
    })
  }

  private callBehaviors: Behavior = (entity: Entity, args: { phase: string }, delta: number) => {
    this._state = getComponent(entity, State)
    this._state.data.forEach((stateValue: StateValue<NumericalType>) => {
      if (
        this._state.schema.states[stateValue.state] !== undefined &&
        this._state.schema.states[stateValue.state][args.phase] !== undefined
      ) {
        if (stateValue.lifecycleState === LifecycleValue.STARTED) {
          this._state.data.set(stateValue.state, {
            ...stateValue,
            lifecycleState: LifecycleValue.CONTINUED
          })
        }
        this._state.schema.states[stateValue.state][args.phase].behavior(
          entity,
          this._state.schema.states[stateValue.state][args.phase].args,
          delta
        )
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
