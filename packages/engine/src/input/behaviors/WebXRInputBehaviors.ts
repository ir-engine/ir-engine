import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';


export const addPhysics: Behavior = (entity: Entity) => {
	// const xRControllers = getMutableComponent(entity, XRInputReceiver)
	// console.warn(xRControllers);
	// xRControllers.leftHandPhysicsBody = addColliderWithoutEntity(
	// 	'sphere',
	// 	xRControllers.controllerPositionLeft,
	// 	xRControllers.controllerRotationLeft,
	//   {x: 0.08, y: 0.08, z: 0.08},
	// )
	// xRControllers.rightHandPhysicsBody = addColliderWithoutEntity(
	// 	'sphere',
	// 	xRControllers.controllerPositionRight,
	// 	xRControllers.controllerRotationRight,
	// 	{x: 0.08, y: 0.08, z: 0.08},
	// )
};

export const removeWebXRPhysics: Behavior = (entity: Entity, args: any) => {
// if (args.leftControllerPhysicsBody) {
// 	PhysicsSystem.instance.removeBody(args.leftControllerPhysicsBody)
// 	PhysicsSystem.instance.removeBody(args.rightControllerPhysicsBody)
// }
// 	console.warn(args);
};