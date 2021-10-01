import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { TriggerVolumeComponent } from '../../scene/components/TriggerVolumeComponent'
import { TriggerDetectedComponent } from '../../scene/components/TriggerDetectedComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'

export const detectUserInTrigger = (entity: Entity): void => {
  // const raycastComponent = getComponent(entity, RaycastComponent)
  // if (!raycastComponent?.raycastQuery?.hits[0]?.body?.userData?.entity) return

  const raycastComponent = getComponent(entity, RaycastComponent)
  const triggerEntity = raycastComponent.hits[0]?.body?.userData?.entity
  if (triggerEntity) {
    if (typeof triggerEntity !== 'undefined') {
      let triggerComponent = getComponent(triggerEntity, TriggerVolumeComponent)
      if (triggerComponent) {
        if (!triggerComponent.active) {
          triggerComponent.active = true
          console.log('trigger active')
          addComponent(triggerEntity, TriggerDetectedComponent, {})
          const interval = setInterval(() => {
            if (triggerComponent.active && raycastComponent.hits[0]?.body!.userData.entity !== triggerEntity) {
              console.log('removing trigger')
              triggerComponent.active = false
              removeComponent(triggerEntity, TriggerDetectedComponent)
              clearInterval(interval)
            }
          }, 100)
        }
      }
    }
  }
}
