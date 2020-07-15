import StateType from "../types/StateAlias"
import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { getComponentsFromStateGroup } from "./StateGroupBehaviors"
import State from "../components/State"
import StateMap from "../interfaces/StateMap"
import BinaryValue from "../../common/enums/BinaryValue"

let stateMap: StateMap
let stateGroup: any

export const setState: Behavior = (entity: Entity, args: { value: BinaryValue; stateType: StateType }): void => {
  if (args.value === BinaryValue.ON) addState(entity, args)
  else removeState(entity, args)
}

export const addState: Behavior = (entity: Entity, args: { state: StateType }): void => {
  console.log("addState")
  // TODO: Simplify and check for efficiency
  // check state group
  stateMap = entity.getComponent(State).map
  console.log(args.state)
  console.log(stateMap.states[0])
  stateGroup = stateMap.states[args.state].group
  // If state group is set to exclusive (XOR) then check if other states from state group are on
  if (stateMap.groups[stateGroup].exclusive) {
    getComponentsFromStateGroup(entity, stateGroup).forEach((component: any) => {
      entity.removeComponent(component)
    })
  }
  entity.addComponent(stateMap.states[args.state].component)
  console.log("Added component to " + entity.id)
}

export const removeState: Behavior = (entity: Entity, args: { stateType: StateType }): void => {
  // check state group
  stateMap = entity.getComponent(State).map
  entity.removeComponent(stateMap.states[args.stateType].component)
  console.log("Removed component from " + entity.id)
}
