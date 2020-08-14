import { Component } from "./Component"

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

export default function wrapImmutableComponent<T>(x, component: Component<any>): T {
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
