import { Entity } from '../../ecs/Entity'
import { removeComponent } from '../../ecs/ComponentFunctions'
import { AutoPilotComponent } from '../component/AutoPilotComponent'

export const stopAutopilot = (entity: Entity): void => {
  console.log('stopAutopilot: for ', entity)
  removeComponent(entity, AutoPilotComponent)
}
