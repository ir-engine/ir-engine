import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { CallbackComponent } from '../components/CallbackComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

export const triggerEnter = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent) return

  const targetEntity = triggerComponent.target
    ? world.entityTree.uuidNodeMap.get(triggerComponent.target)!.entity
    : triggerEntity

  if (targetEntity) {
    const callbacks = getComponent(targetEntity, CallbackComponent)
    if (callbacks[triggerComponent.onEnter]) {
      callbacks[triggerComponent.onEnter](triggerEntity)
    }
  }
}

export const triggerExit = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent) return

  const targetEntity = triggerComponent.target
    ? world.entityTree.uuidNodeMap.get(triggerComponent.target)!.entity
    : triggerEntity

  if (targetEntity) {
    const callbacks = getComponent(targetEntity, CallbackComponent)
    if (callbacks[triggerComponent.onExit]) {
      callbacks[triggerComponent.onExit](triggerEntity)
    }
  }
}

export default async function TriggerSystem(world: World) {
  const collisionQuery = defineQuery([CollisionComponent])

  return () => {
    for (const entity of collisionQuery()) {
      for (const [e, hit] of getComponent(entity, CollisionComponent)) {
        if (hit.type === CollisionEvents.TRIGGER_START) {
          triggerEnter(world, entity, e, hit)
        }
        if (hit.type === CollisionEvents.TRIGGER_END) {
          triggerExit(world, entity, e, hit)
        }
      }
    }
  }
}
