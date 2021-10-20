import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ColliderComponentType = {
  body: PhysX.PxRigidStatic | PhysX.PxRigidDynamic
}

export const ColliderComponent = createMappedComponent<ColliderComponentType>('ColliderComponent')
