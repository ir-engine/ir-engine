import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ObstaclesComponentType = {
  obstacles: Array<PhysX.PxBoxObstacle | PhysX.PxCapsuleObstacle>
}

export const ObstaclesComponent = createMappedComponent<ObstaclesComponentType>('ObstaclesComponent')
