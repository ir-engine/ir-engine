import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { World } from '../../ecs/classes/World'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../components/TriggerDetectedComponent'

/**
 * @author Hamza Mushtaq <github.com/hamzzam>
 */

export const TriggerSysyem = async (): Promise<System> => {
  const triggerCollidedQuery = defineQuery([TriggerVolumeComponent, TriggerDetectedComponent])
  const triggerEnterQuery = enterQuery(triggerCollidedQuery)
  const triggerExitQuery = exitQuery(triggerCollidedQuery)

  return defineSystem((world: World) => {
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

    for (const entity of triggerExitQuery(world)) {
      let triggerComponent = getComponent(entity, TriggerVolumeComponent)

      const args = triggerComponent.args
      let leaveComponent = args.leaveComponent
      let leaveProperty = args.leaveProperty
      let leaveValue = args.leaveValue

      let targetObj = Engine.scene.getObjectByProperty('sceneEntityId', args.target) as any

      if (leaveComponent === 'video' || leaveComponent === 'volumteric') {
        if (leaveProperty === 'paused') {
          if (leaveValue) {
            targetObj.pause()
          } else {
            targetObj.play()
          }
        }
      } else if (leaveComponent === 'loop-animation') {
        if (leaveProperty === 'paused') {
          if (leaveValue) {
            targetObj.stopAnimation()
          } else {
            targetObj.playAnimation()
          }
        }
      }

      console.log('handleTriggerExit')
    }

    return world
  })
}
