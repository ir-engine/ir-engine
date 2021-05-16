import { Vector3, Quaternion } from 'three';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getMutableComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { CollisionGroups } from '../../../../physics/enums/CollisionGroups';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addRestitution: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const collider = getMutableComponent(entity, ColliderComponent);
  collider.body.shapes[0].config.material = { staticFriction: 0.3, dynamicFriction: 0.3, restitution: 0.9 };
};
