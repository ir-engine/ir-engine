import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { CollisionEvents } from '../../physics/types/PhysicsTypes'
import { Object3DComponent } from '../components/Object3DComponent'
import { PortalComponent } from '../components/PortalComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

export const triggerEnter = (world: World, entity: Entity, triggerEntity: Entity) => {
  if (!getState(EngineState).isTeleporting.value && getComponent(triggerEntity, PortalComponent)) {
    const portalComponent = getComponent(triggerEntity, PortalComponent)
    world.activePortal = portalComponent
    dispatchAction(EngineActions.setTeleporting({ isTeleporting: true }))
    return
  }

  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent) return

  const onEnter = triggerComponent.onEnter
  if (!onEnter) return

  const targetObj = world.entityTree.uuidNodeMap.get(triggerComponent.target)!

  if (targetObj) {
    const obj3d = getComponent(targetObj.entity, Object3DComponent).value
    if (obj3d[onEnter]) {
      obj3d[onEnter]()
    }
  }
}

export const triggerExit = (world: World, entity: Entity, triggerEntity: Entity) => {
  const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
  if (!triggerComponent) return

  const onExit = triggerComponent.onExit
  const targetObj = world.entityTree.uuidNodeMap.get(triggerComponent.target)

  if (targetObj) {
    const obj3d = getComponent(targetObj.entity, Object3DComponent).value
    if (obj3d[onExit]) {
      obj3d[onExit]()
    }
  }
}

export default async function TriggerSystem(world: World) {
  const collisionQuery = defineQuery([CollisionComponent])

  return () => {
    for (const entity of collisionQuery()) {
      for (const [e, hit] of getComponent(entity, CollisionComponent)) {
        if (hit.type === CollisionEvents.TRIGGER_START) {
          triggerEnter(world, entity, e)
        }
        if (hit.type === CollisionEvents.TRIGGER_END) {
          triggerExit(world, entity, e)
        }
      }
    }
  }
}
