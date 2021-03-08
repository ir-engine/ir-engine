import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { XRInputReceiver } from '../components/XRInputReceiver';

export const addPhysics: Behavior = (entity: Entity) => {
	const xRControllers = getMutableComponent(entity, XRInputReceiver)
	console.warn(xRControllers);
	xRControllers.leftHandPhysicsBody = addColliderWithoutEntity(
		'sphere',
		xRControllers.controllerPositionLeft,
		xRControllers.controllerRotationLeft,
	  {x: 0.08, y: 0.08, z: 0.08},
		null
	)
	xRControllers.rightHandPhysicsBody = addColliderWithoutEntity(
		'sphere',
		xRControllers.controllerPositionRight,
		xRControllers.controllerRotationRight,
		{x: 0.08, y: 0.08, z: 0.08},
		null
	)
};

export const removeWebXRPhysics: Behavior = (entity: Entity, args: any) => {
if (args.leftControllerPhysicsBody) {
	PhysicsSystem.physicsWorld.removeBody(args.leftControllerPhysicsBody)
	PhysicsSystem.physicsWorld.removeBody(args.rightControllerPhysicsBody)
}
	console.warn(args);
};