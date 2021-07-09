import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const objectMove: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const position = getMutableComponent(entity, TransformComponent).position
  const collider = getComponent(entity, ColliderComponent)

  position.set(
    position.x + (delta * args.vectorAndSpeed?.x ?? 0),
    position.y + (delta * args.vectorAndSpeed?.y ?? 0),
    position.z + (delta * args.vectorAndSpeed?.y ?? 0)
  )

  collider?.body.updateTransform({
    translation: {
      x: position.x,
      y: position.y,
      z: position.z
    }
  })
}
