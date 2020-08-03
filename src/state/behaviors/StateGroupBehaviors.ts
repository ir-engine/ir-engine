import StateGroupAlias from "../types/StateGroupAlias"
import { Entity, Component } from "ecsy"
import StateSchema from "../interfaces/StateSchema"
import State from "../components/State"

let stateSchema: StateSchema
let stateGroupExists: boolean
let component: Component<any>
let components: Component<any>[]
// component from state group exists
export const componentsFromStateGroupExist = (entity: Entity, stateGroupType: StateGroupAlias, ignoreComponent?: Component<any>): boolean => {
  stateGroupExists = false
  stateSchema = entity.getComponent(State).schema
  Object.keys(stateSchema.groups[stateGroupType].states).forEach(key => {
    if (ignoreComponent && ignoreComponent === stateSchema.states[key].component) return
    if (entity.getComponent(stateSchema.states[key].component)) stateGroupExists = true
  })
  return stateGroupExists
}

export const removeComponentsFromStateGroup = (entity: Entity, group: StateGroupAlias, ignoreComponent?: Component<any>): void => {
  getComponentsFromStateGroup(entity, group).forEach((component: any) => {
    if (ignoreComponent && ignoreComponent === component) return
    entity.removeComponent(component)
  })
  console.log("Removed component")
}

export const getComponentsFromStateGroup = (entity: Entity, group: StateGroupAlias): Component<any>[] => {
  components = []
  stateSchema = entity.getComponent(State).schema
  Object.keys(stateSchema.groups[group].states).forEach(key => {
    if (entity.getComponent(stateSchema.states[key].component)) components.push(stateSchema.states[key].component)
  })
  return components
}

export const getComponentFromStateGroup = (entity: Entity, stateGroupType: StateGroupAlias): Component<any> | null => {
  stateSchema = entity.getComponent(State).schema
  Object.keys(stateSchema.groups[stateGroupType].states).forEach(element => {
    if (entity.getComponent(stateSchema.states[element].component)) component = stateSchema.states[element].component
  })
  return component
}
