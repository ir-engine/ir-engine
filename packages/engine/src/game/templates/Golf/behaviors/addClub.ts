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

export const addClub: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const shapeHandle: Shape = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.05, y: 0.05, z: 0.25 } },
  });
  const shapeHead: Shape = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.05, y: 0.1, z: 0.05 } },
    transform: new Transform({
      translation: { x: 0, y: 0.1, z: -1.7 }
    }),
  });
  
  const body = new Body({
    shapes: [shapeHandle, shapeHead],
    type: BodyType.KINEMATIC,
    transform: new Transform(),
  });

  PhysicsSystem.instance.addBody(body);

  createNetworkRigidBody({ 
    entity,
    parameters: { body, bodytype: BodyType.KINEMATIC },
    uniqueId:'golf-club' + entity.id
  })

  const interactiveData = {
    onInteraction: onInteraction,
    onInteractionFocused: onInteractionHover,
    onInteractionCheck: () => { return true },
    data: {
      interactionType: 'equippable'
    }
  };

  addComponent(entity, Interactable, interactiveData);
};
