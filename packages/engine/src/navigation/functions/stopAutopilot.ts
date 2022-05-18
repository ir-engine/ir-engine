import { Entity } from '../../ecs/classes/Entity'
import { removeComponent } from '../../ecs/functions/ComponentFunctions'
import { AutoPilotComponent } from '../component/AutoPilotComponent'

export const stopAutopilot = (entity: Entity): void => {
  console.log('stopAutopilot: for ', entity)
  removeComponent(entity, AutoPilotComponent)
}
