import { Component, ComponentConstructor } from "../classes/Component"
import { ObjectPool } from "../classes/ObjectPool"
import { Engine } from "../classes/Engine"
import { getName } from "./Utils"

const proxyMap = new WeakMap()

const proxyHandler = {
  set(target, prop) {
    throw new Error(
      `Tried to write to "${target.name}#${String(
        prop
      )}" on immutable component. Use .getMutableComponent() to modify a component.`
    )
  }
}

export function Not(Component) {
  return {
    type: "not" as const,
    Component: Component
  }
}

export function wrapImmutableComponent<T>(component: Component<T>): T {
  if (component === undefined) {
    return undefined
  }

  let wrappedComponent = proxyMap.get(component)

  if (!wrappedComponent) {
    wrappedComponent = new Proxy(component, proxyHandler)
    proxyMap.set(component, wrappedComponent)
  }

  return <T>wrappedComponent
}

export function registerComponent<C extends Component<any>>(
  Component: ComponentConstructor<C>,
  objectPool?: ObjectPool<C> | false
): void {
  if (Engine.components.indexOf(Component) !== -1) {
    console.warn(`Component type: '${getName(Component)}' already registered.`)
    return
  }

  const schema = Component.schema

  if (!schema) {
    throw new Error(`Component "${getName(Component)}" has no schema property.`)
  }

  for (const propName in schema) {
    const prop = schema[propName]

    if (!prop.type) {
      throw new Error(`Invalid schema for component "${getName(Component)}". Missing type for "${propName}" property.`)
    }
  }

  Component._typeId = Engine.nextComponentId++
  Engine.components.push(Component)
  Engine.componentsMap[Component._typeId] = Component
  Engine.numComponents[Component._typeId] = 0

  if (objectPool === undefined) {
    objectPool = new ObjectPool(Component)
  } else if (objectPool === false) {
    objectPool = undefined
  }

  Engine.componentPool[Component._typeId] = objectPool
}

export function hasRegisteredComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean {
  return Engine.components.indexOf(Component) !== -1
}

export function getPoolForComponent(component: Component<any>): void {
  Engine.componentPool[component._typeId]
}