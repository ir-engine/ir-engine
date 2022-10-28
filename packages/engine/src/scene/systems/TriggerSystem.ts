import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { CallbackComponent } from '../components/CallbackComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { NameComponent } from '../components/NameComponent'

export const triggerEnter = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  for (let i = 0; i < triggerComponent.target.value.length; i++) {
    if (!triggerComponent?.onEnter.value[i]) return
    if (triggerComponent.target.value[i] && !world.entityTree.uuidNodeMap.has(triggerComponent.target.value[i])) return

    const targetEntity = triggerComponent.target.value[i]
      ? world.entityTree.uuidNodeMap.get(triggerComponent.target.value[i])!.entity
      : triggerEntity

    if (targetEntity) {
      const callbacks = getComponent(targetEntity, CallbackComponent)
      callbacks.get(triggerComponent.onEnter.value[i])?.(triggerEntity)
    }
  }
}

export const triggerExit = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  for (let i = 0; i < triggerComponent.target.value.length; i++) {
    if (!triggerComponent?.onExit.value[i]) return
    if (triggerComponent.target.value[i] && !world.entityTree.uuidNodeMap.has(triggerComponent.target.value[i])) return

    const targetEntity = triggerComponent.target.value[i]
      ? world.entityTree.uuidNodeMap.get(triggerComponent.target.value[i])!.entity
      : triggerEntity

    if (targetEntity) {
      const callbacks = getComponent(targetEntity, CallbackComponent)
      callbacks.get(triggerComponent.onExit.value[i])?.(triggerEntity)
    }
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
