import { removeComponent } from '../../ecs/functions/EntityFunctions'
import { AutoPilotComponent } from '../component/AutoPilotComponent'

export const stopAutopilot = (entity: number): void => {
  console.log('stopAutopilot: for ', entity)
  removeComponent(entity, AutoPilotComponent)
}
