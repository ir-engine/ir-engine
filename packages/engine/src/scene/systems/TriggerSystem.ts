import { World } from '../../ecs/classes/World'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../components/TriggerDetectedComponent'
import { System } from '../../ecs/classes/System'
import { PortalComponent } from '../components/PortalComponent'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { EngineActions } from '../../ecs/classes/EngineService'

/**
 * @author Hamza Mushtaq <github.com/hamzzam>
 */

export default async function TriggerSystem(world: World): Promise<System> {
  const triggerCollidedQuery = defineQuery([TriggerDetectedComponent])
  const sceneEntityCaches: any = []

  return () => {
    for (const entity of triggerCollidedQuery.enter(world)) {
      const { triggerEntity } = getComponent(entity, TriggerDetectedComponent)

      if (getComponent(triggerEntity, PortalComponent)) {
        const portalComponent = getComponent(triggerEntity, PortalComponent)
        if (Engine.currentWorld.isInPortal) continue
        dispatchLocal(EngineActions.portalRedirectEvent(portalComponent) as any)
      }

      const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
      const onEnter = triggerComponent.onEnter
      if (!onEnter) continue

      const filtered = sceneEntityCaches.filter((cache: any) => cache.target == triggerComponent.target)
      let targetObj: any
      console.log(filtered)
      if (filtered.length > 0) {
        const filtedData: any = filtered[0]
        targetObj = filtedData.object
      } else {
        targetObj = world.entityTree.findNodeFromUUID(triggerComponent.target)
        if (targetObj) {
          sceneEntityCaches.push({
            target: triggerComponent.target,
            object: targetObj
          })
        }
      }
      if (targetObj) {
        if (targetObj[onEnter]) {
          targetObj[onEnter]()
        } else if (targetObj.execute) {
          targetObj.execute(onEnter)
        }
      }
    }

    for (const entity of triggerCollidedQuery.exit(world)) {
      const { triggerEntity } = getComponent(entity, TriggerDetectedComponent, true)
      const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)

      if (!triggerCollidedQuery) continue
      const onExit = triggerComponent.onExit

      const filtered = sceneEntityCaches.filter((cache: any) => cache.target == triggerComponent.target)
      let targetObj: any
      if (filtered.length > 0) {
        const filtedData: any = filtered[0]
        targetObj = filtedData.object
      } else {
        targetObj = world.entityTree.findNodeFromUUID(triggerComponent.target)
        if (targetObj) {
          sceneEntityCaches.push({
            target: triggerComponent.target,
            object: targetObj
          })
        }
      }
      if (targetObj) {
        if (targetObj[onExit]) {
          targetObj[onExit]()
        } else if (targetObj.execute) {
          targetObj.execute(onExit)
        }
      }
    }
    return world
  }
}
