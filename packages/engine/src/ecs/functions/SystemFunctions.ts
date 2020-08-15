import { System, SystemConstructor } from "../classes/System"
import { World } from "../classes/World"
import { now } from "./Utils"

export function registerSystem(SystemClass: SystemConstructor<any>, attributes?: object): void {
  if (!SystemClass.isSystem) {
    throw new Error(`System '${SystemClass.name}' does not extend 'System' class`)
  }

  if (getSystem(SystemClass) !== undefined) {
    console.warn(`System '${SystemClass.name}' already registered.`)
  }

  const system = new SystemClass(World.world, attributes)
  if (system.init) system.init(attributes)
  system.order = World.systems.length
  World.systems.push(system)
  if (system.execute) {
    World.executeSystems.push(system)
    sortSystems()
  }
}

export function unregisterSystem(SystemClass: SystemConstructor<any>): void {
  const system = getSystem(SystemClass)
  if (system === undefined) {
    console.warn(`Can unregister system '${SystemClass.name}'. It doesn't exist.`)
  }

  World.systems.splice(World.systems.indexOf(system), 1)

  if (system.execute) World.executeSystems.splice(World.executeSystems.indexOf(system), 1)
}

export function getSystem<S extends System>(SystemClass: SystemConstructor<S>): S {
  return World.systems.find(s => s instanceof SystemClass)
}

export function getSystems(): Array<System> {
  return World.systems
}

export function removeSystem(SystemClass) {
  const index = World.systems.indexOf(SystemClass)
  if (!~index) return

  World.systems.splice(index, 1)
}

export function executeSystem(system: System, delta: number, time: number): void {
  if (system.initialized) {
    if (system.canExecute()) {
      const startTime = now()
      system.execute(delta, time)
      system.executeTime = now() - startTime
      World.lastExecutedSystem = system
    }
  }
}

export function sortSystems() {
  World.executeSystems.sort((a, b) => {
    return a.priority - b.priority || a.order - b.order
  })
}
