import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES, Transform } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { addComponent } from '../../../../ecs/functions/EntityFunctions';
import { onInteraction, onInteractionHover } from '../../../../scene/behaviors/createCommonInteractive';
import { Interactable } from '../../../../interaction/components/Interactable';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const grabGolfClub: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.log('grabGolfClub', entity)
};
