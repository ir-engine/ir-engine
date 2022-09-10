import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getAllComponents, getComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { CallbackComponent } from '../components/CallbackComponent'
import { ColliderComponent } from '../components/ColliderComponent'

let getTargetComponent = function (triggerComponent, targetObj: Entity) {
  const comps = getAllComponents(targetObj)
  var targetComponent
  for (let i = 0; i < comps.length; i++) {
    if (comps[i]._name == triggerComponent.targetComponent) {
      targetComponent = getComponent(targetObj, comps[i])
      break
    }
  }
  return targetComponent
}

export const triggerEnter = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  if (triggerComponent?.triggerType == '') return
  if (triggerComponent.target && !world.entityTree.uuidNodeMap.has(triggerComponent.target)) return

  const targetEntity = triggerComponent.target
    ? world.entityTree.uuidNodeMap.get(triggerComponent.target)!.entity
    : triggerEntity

  const onEnter = triggerComponent.triggerEvent

  if (triggerComponent.triggerType != '1') return

  const targetComponent = getTargetComponent(triggerComponent, targetEntity)

  const prop = onEnter.split('.')

  if (targetComponent) {
    const componentProperty = targetComponent[prop[0]]
    if (prop.length == 1) {
      componentProperty()
      return
    }
    if (componentProperty) {
      if (componentProperty[prop[1]]) {
        componentProperty[prop[1]]()
      }
    }
  }
}

export const triggerExit = (world: World, entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  if (triggerComponent?.triggerType == '') return
  if (triggerComponent.target && !world.entityTree.uuidNodeMap.has(triggerComponent.target)) return

  const targetEntity = triggerComponent.target
    ? world.entityTree.uuidNodeMap.get(triggerComponent.target)!.entity
    : triggerEntity

  const onExit = triggerComponent.triggerEvent

  if (triggerComponent.triggerType != '2') return

  const targetComponent = getTargetComponent(triggerComponent, targetEntity)

  const prop = onExit.split('.')

  if (targetComponent) {
    const componentProperty = targetComponent[prop[0]]
    if (prop.length == 1) {
      componentProperty()
      return
    }
    if (componentProperty) {
      if (componentProperty[prop[1]]) {
        componentProperty[prop[1]]()
      }
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
