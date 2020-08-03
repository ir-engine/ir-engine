// import StateGroupType from "../types/StateGroupType"
// import { Entity, Component } from "ecsy"
// import StateMap from "../interfaces/StateMap"
// import State from "../components/State"

// let stateSchema: StateMap
// let stateGroupExists: boolean
// // component from state group exists
// export const componentsFromStateGroupExist = (entity: Entity, stateGroupType: StateGroupType, ignoreComponent?: Component<any>): boolean => {
//   stateGroupExists = false
//   stateSchema = entity.getComponent(State).schema
//   Object.keys(stateSchema.groups[stateGroupType].states).forEach(key => {
//     if (ignoreComponent && ignoreComponent === stateSchema.states[key].component) return
//     if (entity.getComponent(stateSchema.states[key].component)) stateGroupExists = true
//   })
//   return stateGroupExists
// }

// export const removeComponentsFromStateGroup = (entity: Entity, group: StateGroupType, ignoreComponent?: Component<any>): void => {
//   getComponentsFromStateGroup(entity, group).forEach((component: any) => {
//     if (ignoreComponent && ignoreComponent === component) return
//     entity.removeComponent(component)
//   })
//   console.log("Removed component")
// }

// export const getComponentsFromStateGroup = (entity: Entity, group: StateGroupType): Component<any>[] => {
//   components.clear()
//   stateSchema = entity.getComponent(State).schema
//   Object.keys(stateSchema.groups[group].states).forEach(key => {
//     if (entity.getComponent(stateSchema.states[key].component)) components.add(stateSchema.states[key].component)
//   })
//   return components.toArray()
// }

// export const getComponentFromStateGroup = (entity: Entity, stateGroupType: StateGroupType): Component<any> | null => {
//   component = null
//   stateSchema = entity.getComponent(State).schema
//   Object.keys(stateSchema.groups[stateGroupType].states).forEach(element => {
//     if (entity.getComponent(stateSchema.states[element].component)) component = stateSchema.states[element].component
//   })
//   return component
// }
