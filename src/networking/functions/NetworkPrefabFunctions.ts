import { Entity, World } from "ecsy"
import { NetworkObject } from "../components/NetworkObject"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import { Network } from "../components/Network"
import { WorldComponent } from "../../common"

export function createNetworkPrefab(prefab: NetworkPrefab, world: World, networkId: string | number): Entity {
  const entity = world.createEntity()
  // Add a NetworkObject component to the entity, this will store information about changing state
  entity.addComponent(NetworkObject, { networkId })
  // Instantiate network components
  // These will be attached to the entity on all clients
  prefab.networkComponents?.forEach(component => {
    // Register the component if it hasn't already been registered with the world
    if (!WorldComponent.instance.world.hasRegisteredComponent(component.type)) WorldComponent.instance.world.registerComponent(component.type)
    // Add the component to our entity
    entity.addComponent(component.type)
    // If the component has initialization data...
    // If the component has no initialization data, return
    if (component.data == undefined) return // Get a mutable reference to the component
    const addedComponent = entity.getMutableComponent(component.type)
    // Set initialization data for each key
    Object.keys(component.data).forEach(initValue => {
      // Get the component on the entity, and set it to the initializing value from the prefab
      addedComponent[initValue] = component.data[initValue]
      console.log("Called this code")
      console.log("Set ", initValue, " to ", component.data[initValue])
    })
  })
  // Instantiate local components
  // If this is the local player, spawn the local components (these will not be spawned for other clients)
  // This is good for input, camera, etc
  if (networkId === (Network.instance as Network).mySocketID && prefab.components)
    // For each local component on the prefab...
    prefab.components?.forEach(component => {
      // If the component hasn't been registered with the world, register it
      if (!WorldComponent.instance.world.hasRegisteredComponent(component.type)) WorldComponent.instance.world.registerComponent(component.type)
      // The component to the entity
      entity.addComponent(component.type)
      // If the component has no initialization data, return
      if (component.data == undefined) return
      // Get a mutable reference to the component
      const addedComponent = entity.getMutableComponent(component.type)
      // Set initialization data for each key
      Object.keys(component.data).forEach(initValue => {
        // Get the component on the entity, and set it to the initializing value from the prefab
        addedComponent[initValue] = component.data[initValue]
        console.log("Set ", initValue, " to ", component.data[initValue])
      })
    })
  // Call each create action
  prefab.onCreate?.forEach(action => {
    // Call the behavior with the args
    action.behavior(entity, action.args)
  })
  // Call destroy create action
  prefab.onDestroy?.forEach(action => {
    // Call the behavior with the args
    action.behavior(entity, action.args)
  })
  return entity
}
