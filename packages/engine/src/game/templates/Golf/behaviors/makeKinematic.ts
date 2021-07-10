import { BodyType } from 'three-physx'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'

export const makeKinematic = (entity: Entity, args: { kinematic: boolean }) => {
  const collider = getComponent(entity, ColliderComponent)
  collider.body.type = args.kinematic ? BodyType.KINEMATIC : BodyType.DYNAMIC
  console.log(collider.body.type)
}
