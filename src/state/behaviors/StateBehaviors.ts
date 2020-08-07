import StateAlias from "../types/StateAlias"
import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import State from "../components/State"
import BinaryValue from "../../common/enums/BinaryValue"
import StateGroupType from "../types/StateGroupAlias"
import { StateType } from "../enums/StateType"
import StateValue from "../interfaces/StateValue"
import { Binary } from "../../common/types/NumericalTypes"
import LifecycleValue from "../../common/enums/LifecycleValue"

let stateComponent: State
let stateGroup: StateGroupType

export const toggleState: Behavior = (entity: Entity, args: { value: Binary; stateType: StateAlias }): void => {
  if (args.value === BinaryValue.ON) addState(entity, args)
  else removeState(entity, args)
}

export const addState: Behavior = (entity: Entity, args: { state: StateAlias }): void => {
  stateComponent = entity.getComponent(State)
  if (stateComponent.data.has(args.state)) return
  stateComponent.data.set(args.state, {
    state: args.state,
    type: StateType.DISCRETE,
    lifecycleState: LifecycleValue.STARTED,
    group: stateComponent.schema.states[args.state].group
  } as StateValue<Binary>)

  stateGroup = stateComponent.schema.states[args.state].group
  // If state group is set to exclusive (XOR) then check if other states from state group are on
  if (stateComponent.schema.groups[stateGroup].exclusive) {
    stateComponent.schema.groups[stateGroup].states.forEach(state => {
      if (state === args.state || !stateComponent.data.has(state)) return
      stateComponent.data.delete(state)
    })
  }
}

export const removeState: Behavior = (entity: Entity, args: { state: StateAlias }): void => {
  // check state group
  stateComponent = entity.getComponent(State)
  if (stateComponent.data.has(args.state)) {
    stateComponent.data.delete(args.state)
  }
}

export const hasState: Behavior = (entity: Entity, args: { state: StateAlias }): boolean => {
  // check state group
  stateComponent = entity.getComponent(State)
  if (stateComponent.data.has(args.state)) return true
  return false
}
