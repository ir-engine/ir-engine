import { World } from '../../ecs/classes/World'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../components/TriggerDetectedComponent'
import { System } from '../../ecs/classes/System'

/**
 * @author Hamza Mushtaq <github.com/hamzzam>
 */

export default async function TriggerSystem(world: World): Promise<System> {
  const triggerCollidedQuery = defineQuery([TriggerVolumeComponent, TriggerDetectedComponent])

  return () => {
    for (const entity of triggerCollidedQuery.enter(world)) {
      let triggerComponent = getComponent(entity, TriggerVolumeComponent)

      const args = triggerComponent.args
      let onEnter = args.onEnter

      console.log(triggerComponent)

      let targetObj = Engine.scene.getObjectByProperty('sceneEntityId', args.target) as any
      console.log('handleTriggerEnter', targetObj)
      if (targetObj[onEnter]) {
        targetObj[onEnter]()
      } else if (targetObj.execute) {
        targetObj.execute(onEnter)
      }
    }

    for (const entity of triggerCollidedQuery.exit(world)) {
      let triggerComponent = getComponent(entity, TriggerVolumeComponent)

      const args = triggerComponent.args
      let onExit = args.onExit

      console.log(triggerComponent)

      let targetObj = Engine.scene.getObjectByProperty('sceneEntityId', args.target) as any
      console.log('handleTriggerExit', targetObj)
      if (targetObj[onExit]) {
        targetObj[onExit]()
      } else if (targetObj.execute) {
        targetObj.execute(onExit)
      }
    }

    return world
  }
}
