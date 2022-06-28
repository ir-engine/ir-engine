import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ScreenshareTargetComponentType = {}

export const ScreenshareTargetComponent =
  createMappedComponent<ScreenshareTargetComponentType>('ScreenshareTargetComponent')
