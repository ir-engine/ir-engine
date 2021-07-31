import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { Body, BodyType, ColliderHitEvent, ShapeType, SHAPES, Transform, PhysXInstance } from 'three-physx'
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem'

import { addComponent, getComponent, hasComponent, removeComponent } from '../../../../ecs/functions/EntityFunctions'
import { GameObject } from '../../../components/GameObject'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { GolfCollisionGroups } from '../GolfGameConstants'
import { Object3DComponent } from '../../../../scene/components/Object3DComponent'
import { getGame } from '../../../functions/functions'
import { GameObjectInteractionBehavior } from '../../../interfaces/GameObjectPrefab'
import { Action, State } from '../../../types/GameComponents'
import { addActionComponent } from '../../../functions/functionsActions'

export const onHoleCollideWithBall: GameObjectInteractionBehavior = (
  entityHole: Entity,
  delta: number,
  args: { hitEvent: ColliderHitEvent },
  entityBall: Entity
) => {
  if (args.hitEvent.type === 'TRIGGER_START') {
    addActionComponent(entityHole, Action.GameObjectCollisionTag)
    addActionComponent(entityBall, Action.GameObjectCollisionTag)
  } else if (args.hitEvent.type === 'TRIGGER_END') {
    removeComponent(entityHole, Action.GameObjectCollisionTag)
    removeComponent(entityBall, Action.GameObjectCollisionTag)
  }
}

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addHole: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const transform = getComponent(entity, TransformComponent)
  const pos = transform.position ?? { x: 0, y: 0, z: 0 }
  const rot = transform.rotation ?? { x: 0, y: 0, z: 0, w: 1 }
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

  addComponent(entity, ColliderComponent, {
    bodytype: BodyType.STATIC,
    type: 'box',
    body: body
  })

  const gameObject = getComponent(entity, GameObject)
  gameObject.collisionBehaviors['GolfBall'] = onHoleCollideWithBall
}
