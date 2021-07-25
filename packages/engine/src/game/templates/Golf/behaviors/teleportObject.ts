import { Vector3 } from 'three'
import { isClient } from '../../../../common/functions/isClient'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGame, getTargetEntity } from '../../../functions/functions'
import { removeStateComponent } from '../../../functions/functionsState'
import { getStorage } from '../../../functions/functionsStorage'
import { State } from '../../../types/GameComponents'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const teleportObject: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const collider = getMutableComponent(entity, ColliderComponent)
  if (!collider) return
  isClient ? addComponent(entity, State.TeleportBall) : ''

  collider.velocity.set(0, 0, 0)

  collider.body.setLinearDamping(0.1)
  collider.body.setAngularDamping(0.1)

  collider.body.updateTransform({
    translation: {
      x: args.position.x,
      y: args.position.y + 0.5,
      z: args.position.z
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    linearVelocity: {
      x: 0,
      y: 0,
      z: 0
    }
  })

  collider.body.setLinearVelocity(new Vector3(), true)
  collider.body.setAngularVelocity(new Vector3(), true)
}

export const removeVelocity: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  console.log(' --- removeVelocity')
  const collider = getMutableComponent(entity, ColliderComponent)
  if (!collider) return
  //collider.velocity.set(0,0,0);
  collider.body.setLinearDamping(10)
  collider.body.setAngularDamping(10)

  if (isClient && hasComponent(entity, State.TeleportBall)) {
    removeComponent(entity, State.TeleportBall)
  }
  //collider.body.setLinearVelocity(new Vector3(), true);
  //collider.body.setAngularVelocity(new Vector3(), true);
}
