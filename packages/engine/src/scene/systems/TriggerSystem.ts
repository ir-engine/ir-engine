import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { CallbackComponent } from '../components/CallbackComponent'
import { ColliderComponent } from '../components/ColliderComponent'

export const triggerEnter = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  if (!triggerComponent?.onEnter) return
  if (triggerComponent.target && !world.entityTree.uuidNodeMap.has(triggerComponent.target)) return

  const targetEntity = triggerComponent.target
    ? world.entityTree.uuidNodeMap.get(triggerComponent.target)!.entity
    : triggerEntity

  if (targetEntity) {
    const callbacks = getComponent(targetEntity, CallbackComponent)
    callbacks.get(triggerComponent.onEnter)?.(triggerEntity)
  }
}

export const triggerExit = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  if (!triggerComponent?.onExit) return
  if (triggerComponent.target && !world.entityTree.uuidNodeMap.has(triggerComponent.target)) return

  const targetEntity = triggerComponent.target
    ? world.entityTree.uuidNodeMap.get(triggerComponent.target)!.entity
    : triggerEntity

  if (targetEntity) {
    const callbacks = getComponent(targetEntity, CallbackComponent)
    callbacks.get(triggerComponent.onExit)?.(triggerEntity)
  }
}

export default async function TriggerSystem(world: World) {
  const collisionQuery = defineQuery([CollisionComponent])

  const execute = () => {
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

  const cleanup = async () => {
    removeQuery(world, collisionQuery)
  }

  return { execute, cleanup }
}
