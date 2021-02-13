import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { XRControllersComponent } from '../components/XRControllersComponent';

export const addPhysics: Behavior = (entity: Entity) => {
	const xRControllers = getMutableComponent(entity, XRControllersComponent)
	console.warn(xRControllers);
	xRControllers.physicsBody1 = addColliderWithoutEntity(
		'sphere',
		xRControllers.position1,
		xRControllers.rotation1,
	  {x: 0.08, y: 0.08, z: 0.08},
		null
	)
	xRControllers.physicsBody2 = addColliderWithoutEntity(
		'sphere',
		xRControllers.position2,
		xRControllers.rotation2,
		{x: 0.08, y: 0.08, z: 0.08},
		null
	)
};
export const updateWebXRPhysics: Behavior = (entity: Entity) => {
	const xRControllers = getComponent(entity, XRControllersComponent)

	xRControllers.physicsBody1.position.set(
		xRControllers.position1.x,
		xRControllers.position1.y,
		xRControllers.position1.z
	);
	xRControllers.physicsBody2.position.set(
		xRControllers.position2.x,
		xRControllers.position2.y,
		xRControllers.position2.z
	);
	xRControllers.physicsBody1.quaternion.set(
		xRControllers.rotation1.x,
		xRControllers.rotation1.y,
		xRControllers.rotation1.z,
		xRControllers.rotation1.w
	);
	xRControllers.physicsBody2.quaternion.set(
		xRControllers.rotation2.x,
		xRControllers.rotation2.y,
		xRControllers.rotation2.z,
		xRControllers.rotation2.w
	);

};
export const removeWebXRPhysics: Behavior = (entity: Entity, args: any) => {
if (args.controllerPhysicalBody1) {
	PhysicsSystem.physicsWorld.removeBody(args.controllerPhysicalBody1)
	PhysicsSystem.physicsWorld.removeBody(args.controllerPhysicalBody2)
}
	console.warn(args);
};