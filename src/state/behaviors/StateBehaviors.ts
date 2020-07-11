import StateType from "../types/StateType"
import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { getComponentsFromStateGroup } from "./StateGroupBehaviors"
import State from "../components/State"
import StateData from "../../state//interfaces/StateData"

let stateGroupData: StateData
export const addState: Behavior = (entityIn: Entity, args: { stateType: StateType }): void => {
  // TODO: Simplify and check for efficiency
  // check state group
  stateGroupData = entityIn.getComponent(State).data
  const stateGroup = stateGroupData.stateData[args.stateType].group
  // If state group is set to exclusive (XOR) then check if other states from state group are on
  if (stateGroupData.groups[stateGroup].exclusive) {
    getComponentsFromStateGroup(entityIn, stateGroup).forEach((component: any) => {
      entityIn.removeComponent(component)
    })
  }
  entityIn.addComponent(stateGroupData.stateData[args.stateType].component)
  console.log("Added component to " + entityIn.id)
}

export const removeState: Behavior = (entityIn: Entity, args: { stateType: StateType }): void => {
  // check state group
  stateGroupData = entityIn.getComponent(State).data
  entityIn.removeComponent(stateGroupData.stateData[args.stateType].component)
  console.log("Removed component from " + entityIn.id)
}
