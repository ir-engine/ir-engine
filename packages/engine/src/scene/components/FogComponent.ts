import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type FogComponentType = {
  type: string
  color: string
  density: number
  near: number
  far: number
}

export const FogComponent = createMappedComponent<FogComponentType>('FogComponent')
