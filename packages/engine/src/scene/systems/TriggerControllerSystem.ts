import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../components/TriggerDetectedComponent'

/**
 * @author Gheric Speiginer <github.com/speigg>
 */

export const TriggerControllerSysyem = async (): Promise<System> => {
  const triggerCollidedQuery = defineQuery([TriggerVolumeComponent, TriggerDetectedComponent])
  const triggerEnterQuery = enterQuery(triggerCollidedQuery)
  const triggerExitQuery = exitQuery(triggerCollidedQuery)

  return defineSystem((world: ECSWorld) => {
    for (const entity of triggerEnterQuery(world)) {
      let triggerComponent = getComponent(entity, TriggerVolumeComponent)

      const args = triggerComponent.args
      let enterComponent = args.enterComponent
      let enterProperty = args.enterProperty
      let enterValue = args.enterValue

      let targetObj = Engine.scene.getObjectByProperty('sceneEntityId', args.target) as any

      if (enterComponent === 'video' || enterComponent === 'volumteric') {
        if (enterProperty === 'paused') {
          if (enterValue) {
            targetObj.pause()
          } else {
            targetObj.play()
          }
        }
      } else if (enterComponent === 'loop-animation') {
        if (enterProperty === 'paused') {
          if (enterValue) {
            targetObj.stopAnimation()
          } else {
            targetObj.playAnimation()
          }
        }
      }

      console.log('handleTriggerEnter')
    }

    for (const entity of nameExitQuery(world)) {
      const { name } = NameComponent.get(entity)
      world.world.namedEntities.delete(name)
    }

    return world
  })
}
