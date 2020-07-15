import StateAlias from "../types/StateAlias"
import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import State from "../components/State"
import BinaryValue from "../../common/enums/BinaryValue"
import StateGroupType from "../types/StateGroupType"
import { StateType } from "../enums/StateType"
import StateValue from "../interfaces/StateValue"
import { Binary, NumericalType } from "../../common/types/NumericalTypes"

let stateComponent: State
let stateGroup: StateGroupType

export const setState: Behavior = (entity: Entity, args: { value: BinaryValue; stateType: StateAlias }): void => {
  if (args.value === BinaryValue.ON) addState(entity, args)
  else removeState(entity, args)
}

export const addState: Behavior = (entity: Entity, args: { state: StateAlias }): void => {
  stateComponent = entity.getComponent(State)
  if (stateComponent.data.has(args.state) && stateComponent.data.get(args.state).value === BinaryValue.ON) {
    return
  }
  console.log("Adding state: " + args.state)
  stateComponent.data.set(args.state, {
    state: args.state,
    type: StateType.DISCRETE,
    value: BinaryValue.ON,
    group: stateComponent.map.states[args.state].group
  } as StateValue<Binary>)

  // stateGroup = stateComponent.map.states[args.state].group
  // // If state group is set to exclusive (XOR) then check if other states from state group are on
  // if (stateComponent.map.groups[stateGroup].exclusive) {
  //   stateComponent.data.set(args.state, { ...stateComponent.data.get(args.state), value: BinaryValue.OFF })
  // }
}

export const removeState: Behavior = (entity: Entity, args: { state: StateAlias }): void => {
  // check state group
  stateComponent = entity.getComponent(State)
  stateComponent.data.set(args.state, {
    ...(stateComponent.data.has(args.state)
      ? stateComponent.data.get(args.state)
      : ({
        state: args.state,
        type: StateType.DISCRETE,
        value: BinaryValue.OFF,
        group: stateComponent.map.states[args.state].group
      } as StateValue<Binary>))
  })
  console.log("Removed component from " + entity.id)
}
