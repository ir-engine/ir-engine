import { Body, BodyType, ColliderHitEvent, PhysXInstance, SHAPES, ShapeType, Transform } from 'three-physx'
import { Entity } from '../../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GameObject } from '../../../components/GameObject'
import { addActionComponent } from '../../../functions/functionsActions'
import { GameObjectInteractionBehavior } from '../../../interfaces/GameObjectPrefab'
import { Action } from '../../../types/GameComponents'
import { GolfCollisionGroups } from '../GolfGameConstants'

export const onHoleCollideWithBall: GameObjectInteractionBehavior = (
  entityHole: Entity,
  hitEvent: ColliderHitEvent,
  entityBall: Entity
) => {
  if (hitEvent.type === 'TRIGGER_START') {
    addActionComponent(entityHole, Action.GameObjectCollisionTag)
    addActionComponent(entityBall, Action.GameObjectCollisionTag)
  } else if (hitEvent.type === 'TRIGGER_END') {
    removeComponent(entityHole, Action.GameObjectCollisionTag)
    removeComponent(entityBall, Action.GameObjectCollisionTag)
  }
}

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addHole = (entity: Entity): void => {
  const transform = getComponent(entity, TransformComponent)
  const pos = transform.position ?? { x: 0, y: 0, z: 0 }
  const scale = transform.scale ?? { x: 1, y: 1, z: 1 }

  const shapeBox: ShapeType = {
    shape: SHAPES.Box,
    options: { boxExtents: { x: scale.x / 2, y: scale.y / 2, z: scale.z / 2 } },
    config: {
      isTrigger: true,
      collisionLayer: GolfCollisionGroups.Hole,
      collisionMask: GolfCollisionGroups.Ball
    }
  }

  const body = new Body({
    shapes: [shapeBox],
    type: BodyType.STATIC,
    transform: new Transform({
      translation: { x: pos.x, y: pos.y, z: pos.z }
    })
  })

  PhysXInstance.instance.addBody(body)

  addComponent(entity, ColliderComponent, { body })

  const gameObject = getComponent(entity, GameObject)
  gameObject.collisionBehaviors['GolfBall'] = onHoleCollideWithBall
}
