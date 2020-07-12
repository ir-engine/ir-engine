import StateType from "../types/StateAlias"
import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { getComponentsFromStateGroup } from "./StateGroupBehaviors"
import State from "../components/State"
import StateData from "../../state//interfaces/StateData"
import Binary from "../../common/enums/Binary"

let stateGroupData: StateData

export const setState: Behavior = (entityIn: Entity, args: { value: Binary; stateType: StateType }): void => {
  if (args.value === Binary.ON) addState(entityIn, args)
  else removeState(entityIn, args)
}

export const addState: Behavior = (entityIn: Entity, args: { stateType: StateType }): void => {
  // TODO: Simplify and check for efficiency
  // check state group
  stateGroupData = entityIn.getComponent(State).data
  const stateGroup = stateGroupData.states[args.stateType].group
  // If state group is set to exclusive (XOR) then check if other states from state group are on
  if (stateGroupData.groups[stateGroup].exclusive) {
    getComponentsFromStateGroup(entityIn, stateGroup).forEach((component: any) => {
      entityIn.removeComponent(component)
    })
  }
  entityIn.addComponent(stateGroupData.states[args.stateType].component)
  console.log("Added component to " + entityIn.id)
}

export const removeState: Behavior = (entityIn: Entity, args: { stateType: StateType }): void => {
  // check state group
  stateGroupData = entityIn.getComponent(State).data
  entityIn.removeComponent(stateGroupData.states[args.stateType].component)
  console.log("Removed component from " + entityIn.id)
}
