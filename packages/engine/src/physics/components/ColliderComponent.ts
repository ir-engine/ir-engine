import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ColliderComponentType = {
  body: PhysX.PxRigidStatic | PhysX.PxRigidDynamic
  isTrigger?: boolean
}

export const ColliderComponent = createMappedComponent<ColliderComponentType>('ColliderComponent')
