import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { PortalComponent } from '../components/PortalComponent'
import { TriggerDetectedComponent } from '../components/TriggerDetectedComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

export default async function TriggerSystem(world: World) {
  const triggerCollidedQuery = defineQuery([TriggerDetectedComponent])
  const sceneEntityCaches: any = []

  return () => {
    for (const entity of triggerCollidedQuery.enter(world)) {
      const { triggerEntity } = getComponent(entity, TriggerDetectedComponent)

      if (!getState(EngineState).isTeleporting.value && getComponent(triggerEntity, PortalComponent)) {
        const portalComponent = getComponent(triggerEntity, PortalComponent)
        world.activePortal = portalComponent
        dispatchAction(EngineActions.setTeleporting({ isTeleporting: true }))
        continue
      }

      const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
      const onEnter = triggerComponent.onEnter
      if (!onEnter) continue

      const filtered = sceneEntityCaches.filter((cache: any) => cache.target == triggerComponent.target)
      let targetObj: any

      if (filtered.length > 0) {
        const filtedData: any = filtered[0]
        targetObj = filtedData.object
      } else {
        targetObj = world.entityTree.uuidNodeMap.get(triggerComponent.target)
        if (targetObj) {
          sceneEntityCaches.push({
            target: triggerComponent.target,
            object: targetObj
          })
        }
      }
      if (targetObj) {
        // if (targetObj[onEnter]) {
        //   targetObj[onEnter]()
        // } else if (targetObj.execute) {
        //   targetObj.execute(onEnter)
        // }
        const obj3d = getComponent(targetObj.entity, Object3DComponent).value as any
        if (obj3d[onEnter]) {
          obj3d[onEnter]()
        } else if (obj3d.execute) {
          obj3d.execute(onEnter)
        }
      }
    }

    for (const entity of triggerCollidedQuery.exit(world)) {
      const { triggerEntity } = getComponent(entity, TriggerDetectedComponent, true)
      const triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)

      if (!triggerCollidedQuery || !triggerComponent) continue
      const onExit = triggerComponent.onExit

      const filtered = sceneEntityCaches.filter((cache: any) => cache.target == triggerComponent.target)
      let targetObj: any
      if (filtered.length > 0) {
        const filtedData: any = filtered[0]
        targetObj = filtedData.object
      } else {
        targetObj = world.entityTree.uuidNodeMap.get(triggerComponent.target)
        if (targetObj) {
          sceneEntityCaches.push({
            target: triggerComponent.target,
            object: targetObj
          })
        }
      }
      if (targetObj) {
        // if (targetObj[onExit]) {
        //   targetObj[onExit]()
        // } else if (targetObj.execute) {
        //   targetObj.execute(onExit)
        // }
        const obj3d = getComponent(targetObj.entity, Object3DComponent).value as any
        if (obj3d[onExit]) {
          obj3d[onExit]()
        } else if (obj3d.execute) {
          obj3d.execute(onExit)
        }
      }
    }
    return world
  }
}
