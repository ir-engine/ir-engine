import StateGroupType from "../types/StateGroupType"
import { Entity, Component } from "ecsy"
import StateMap from "../interfaces/StateMap"
import State from "../components/State"
import RingBuffer from "../../common/classes/RingBuffer"

let component: Component<any>
const components = new RingBuffer<Component<any>>(10)
let stateMap: StateMap
let stateGroupExists: boolean
// component from state group exists
export const componentsFromStateGroupExist = (entity: Entity, stateGroupType: StateGroupType, ignoreComponent?: Component<any>): boolean => {
  stateGroupExists = false
  stateMap = entity.getComponent(State).map
  Object.keys(stateMap.groups[stateGroupType].states).forEach(key => {
    if (ignoreComponent && ignoreComponent === stateMap.states[key].component) return
    if (entity.getComponent(stateMap.states[key].component)) stateGroupExists = true
  })
  return stateGroupExists
}

export const removeComponentsFromStateGroup = (entity: Entity, stateGroupType: StateGroupType, ignoreComponent?: Component<any>): void => {
  getComponentsFromStateGroup(entity, stateGroupType).forEach((component: any) => {
    if (ignoreComponent && ignoreComponent === component) return
    entity.removeComponent(component)
  })
  console.log("Removed component")
}

export const getComponentsFromStateGroup = (entity: Entity, group: StateGroupType): Component<any>[] => {
  components.clear()
  stateMap = entity.getComponent(State).map
  Object.keys(stateMap.groups[group].states).forEach(key => {
    console.log("Key: " + key)
    console.log(stateMap.states[key])
    if (entity.getComponent(stateMap.states[key].component)) components.add(stateMap.states[key].component)
  })
  return components.toArray()
}

export const getComponentFromStateGroup = (entity: Entity, stateGroupType: StateGroupType): Component<any> | null => {
  component = null
  stateMap = entity.getComponent(State).map
  Object.keys(stateMap.groups[stateGroupType].states).forEach(element => {
    if (entity.getComponent(stateMap.states[element].component)) component = stateMap.states[element].component
  })
  return component
}
