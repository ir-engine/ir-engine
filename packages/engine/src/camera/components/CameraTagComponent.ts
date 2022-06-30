import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type CameraTagComponentType = {}
export const CameraTagComponent = createMappedComponent<CameraTagComponentType>('CameraTagComponent')
