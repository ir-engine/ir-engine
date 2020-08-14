import { State } from "../components/State"
import { StateSchema } from "../interfaces/StateSchema"
import { StateGroupAlias } from "../types/StateGroupAlias"
import { Component } from "../../ecs/classes/Component"
import { Behavior } from "../../common/interfaces/Behavior"
import { Entity } from "../../ecs/classes/Entity"
import { getComponent, removeComponent } from "../../ecs/functions/EntityFunctions"

let stateSchema: StateSchema
let stateGroupExists: boolean
let component: Component<any>
let components: Component<any>[]
// component from state group exists
export const componentsFromStateGroupExist: Behavior = (
  entity: Entity,
  args: { stateGroupType: StateGroupAlias; ignoreComponent?: Component<any> }
): boolean => {
  stateGroupExists = false
  stateSchema = getComponent<State>(entity, State).schema
  Object.keys(stateSchema.groups[args.stateGroupType].states).forEach(key => {
    if (args.ignoreComponent && args.ignoreComponent === stateSchema.states[key].component) return
    if (getComponent(entity, stateSchema.states[key].component)) stateGroupExists = true
  })
  return stateGroupExists
}

export const removeComponentsFromStateGroup: Behavior = (
  entity: Entity,
  args: { group: StateGroupAlias; ignoreComponent?: Component<any> }
): void => {
  getComponentsFromStateGroup(entity, args).forEach((component: any) => {
    if (args.ignoreComponent && args.ignoreComponent === component) return
    removeComponent(entity, component)
  })
}

export const getComponentsFromStateGroup = (entity: Entity, args: { group: StateGroupAlias }): Component<any>[] => {
  components = []
  stateSchema = getComponent<State>(entity, State).schema
  Object.keys(stateSchema.groups[args.group].states).forEach(key => {
    if (getComponent(entity, stateSchema.states[key].component)) components.push(stateSchema.states[key].component)
  })
  return components
}

export const getComponentFromStateGroup = (
  entity: Entity,
  args: { stateGroupType: StateGroupAlias }
): Component<any> | null => {
  stateSchema = getComponent<State>(entity, State).schema
  Object.keys(stateSchema.groups[args.stateGroupType].states).forEach(element => {
    if (getComponent(entity, stateSchema.states[element].component)) component = stateSchema.states[element].component
  })
  return component
}
