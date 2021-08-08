import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type FogComponentType = {
  type: string
  color: string
  density: number
  near: number
  far: number
}

export const FogComponent = createMappedComponent<FogComponentType>()