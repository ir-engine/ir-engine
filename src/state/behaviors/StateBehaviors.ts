import StateType from "../types/StateAlias"
import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { getComponentsFromStateGroup } from "./StateGroupBehaviors"
import State from "../components/State"
import StateData from "../interfaces/StateMap"
import BinaryValue from "../../common/enums/BinaryValue"

let stateData: StateData
let stateGroup: any

export const setState: Behavior = (entityIn: Entity, args: { value: BinaryValue; stateType: StateType }): void => {
  if (args.value === BinaryValue.ON) addState(entityIn, args)
  else removeState(entityIn, args)
}

export const addState: Behavior = (entityIn: Entity, args: { stateType: StateType }): void => {
  // TODO: Simplify and check for efficiency
  // check state group
  stateData = entityIn.getComponent(State).map
  stateGroup = stateData.states[args.stateType].group
  // If state group is set to exclusive (XOR) then check if other states from state group are on
  if (stateData.groups[stateGroup].exclusive) {
    getComponentsFromStateGroup(entityIn, stateGroup).forEach((component: any) => {
      entityIn.removeComponent(component)
    })
  }
  entityIn.addComponent(stateData.states[args.stateType].component)
  console.log("Added component to " + entityIn.id)
}

export const removeState: Behavior = (entityIn: Entity, args: { stateType: StateType }): void => {
  // check state group
  stateData = entityIn.getComponent(State).map
  entityIn.removeComponent(stateData.states[args.stateType].component)
  console.log("Removed component from " + entityIn.id)
}
