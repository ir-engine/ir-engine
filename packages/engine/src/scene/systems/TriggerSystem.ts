import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineService'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { PortalComponent } from '../components/PortalComponent'
import { TriggerDetectedComponent } from '../components/TriggerDetectedComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

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

      const args = triggerComponent.args
      if (!args) continue
      const onEnter = args.onEnter

      const filtered = sceneEntityCaches.filter((cache: any) => cache.target == args.target)
      let targetObj: any
      console.log(filtered)
      if (filtered.length > 0) {
        const filtedData: any = filtered[0]
        targetObj = filtedData.object
      } else {
        targetObj = Engine.scene.getObjectByProperty('sceneEntityId', args.target) as any
        if (targetObj) {
          sceneEntityCaches.push({
            target: args.target,
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
      const args = triggerComponent.args
      if (!args) continue
      const onExit = args.onExit

      const filtered = sceneEntityCaches.filter((cache: any) => cache.target == args.target)
      console.log(filtered)
      let targetObj: any
      if (filtered.length > 0) {
        const filtedData: any = filtered[0]
        targetObj = filtedData.object
      } else {
        targetObj = Engine.scene.getObjectByProperty('sceneEntityId', args.target) as any
        if (targetObj) {
          sceneEntityCaches.push({
            target: args.target,
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
