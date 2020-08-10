import { Entity, World } from "ecsy"
import { NetworkObject } from "../components/NetworkObject"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import { Network } from "../components/Network"
import { WorldComponent } from "../../common"

export function createNetworkPrefab(prefab: NetworkPrefab, world: World, networkId: string | number): Entity {
  const entity = world.createEntity()
  console.log("Creating prefab")
  console.log(prefab)
  entity.addComponent(NetworkObject, { networkId })
  // Instantiate local components
  // If this is the local player, spawn the local components (these will not be spawned for other clients)
  // This is good for input, camera, etc
  if (networkId === (Network.instance as Network).mySocketID && prefab.components)
    prefab.components?.forEach(component => {
      console.log("Adding ", component, " to prefab")
      if (!WorldComponent.instance.world.hasRegisteredComponent(component.type)) WorldComponent.instance.world.registerComponent(component.type)
      entity.addComponent(component.type)
      component.data?.forEach(initValue => {
        entity.getComponent(component.type)[initValue] = component.data[initValue]
      })
    })
  // Instantiate network components
  // These will be attached to the entity on all clients
  prefab.networkComponents?.forEach(component => {
    console.log("Adding ", component, " to prefab")
    if (!WorldComponent.instance.world.hasRegisteredComponent(component.type)) WorldComponent.instance.world.registerComponent(component.type)
    entity.addComponent(component.type)
    // Set any initialization data
    component.data?.forEach(initValue => {
      entity.getComponent(component.type)[initValue] = component.data[initValue]
    })
    // Call each create action
    console.log("Calling with args: ")
    prefab.onCreate?.forEach(action => {
      console.log(action.args)
      action.behavior(entity, action.args)
    })
  })

  console.log(entity.getComponents())
  return entity
}
