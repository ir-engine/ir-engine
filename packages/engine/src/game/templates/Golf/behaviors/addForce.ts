import { Vector3, Quaternion } from 'three'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addForce: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const collider = getComponent(entityTarget, ColliderComponent)
  const transform = getComponent(entity, TransformComponent)
  console.warn('ADD FORCE')
  const q = new Quaternion().copy(transform.rotation)
  const force = new Vector3(0, 0, args.forwardForce).applyQuaternion(q)
  collider.body.addForce({
    x: force.x,
    y: force.y + args.upForce,
    z: force.z
  })
}
