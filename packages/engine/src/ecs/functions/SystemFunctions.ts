import { System, SystemConstructor } from "../classes/System"
import { Engine } from "../classes/Engine"
import { now } from "./Utils"

export function registerSystem(SystemClass: SystemConstructor<any>, attributes?: object): System {
  if (!SystemClass.isSystem) {
    throw new Error(`System '${SystemClass.name}' does not extend 'System' class`)
  }

  if (getSystem(SystemClass) !== undefined) {
    console.warn(`System '${SystemClass.name}' already registered.`)
  }

  const system = new SystemClass(attributes)
  Engine.systems.push(system)
  if (system.execute) {
    Engine.executeSystems.push(system)
    sortSystems()
  }
  return system as System
}

export function unregisterSystem(SystemClass: SystemConstructor<any>): void {
  const system = getSystem(SystemClass)
  if (system === undefined) {
    console.warn(`Can unregister system '${SystemClass.name}'. It doesn't exist.`)
  }

  Engine.systems.splice(Engine.systems.indexOf(system), 1)

  if (system.execute) Engine.executeSystems.splice(Engine.executeSystems.indexOf(system), 1)
}

export function getSystem<S extends System>(SystemClass: SystemConstructor<S>): S {
  return Engine.systems.find(s => s instanceof SystemClass)
}

export function getSystems(): Array<System> {
  return Engine.systems
}

export function removeSystem(SystemClass) {
  const index = Engine.systems.indexOf(SystemClass)
  if (!~index) return

  Engine.systems.splice(index, 1)
}

export function executeSystem(system: System, delta: number, time: number): void {
  if (system.initialized) {
    if (system.canExecute()) {
      const startTime = now()
      system.execute(delta, time)
      system.executeTime = now() - startTime
      Engine.lastExecutedSystem = system
      system.clearEventQueues()
    }
  }
}

export function sortSystems() {
  Engine.executeSystems.sort((a, b) => {
    return a.priority - b.priority || a.order - b.order
  })
}
