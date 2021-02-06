import { AnimationManager } from "@xr3ngine/engine/src/templates/character/components/AnimationManager";
import { Material, Vec3 } from "cannon-es";
import { BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { LifecycleValue } from "@xr3ngine/engine/src/common/enums/LifecycleValue";
import { isClient } from "@xr3ngine/engine/src/common/functions/isClient";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { addComponent, getComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { RelativeSpringSimulator } from "../../../physics/classes/RelativeSpringSimulator";
import { VectorSpringSimulator } from "../../../physics/classes/VectorSpringSimulator";
import { CapsuleCollider } from "../../../physics/components/CapsuleCollider";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { PhysicsSystem } from "../../../physics/systems/PhysicsSystem";
import { addState } from "../../../state/behaviors/addState";
import { State } from "../../../state/components/State";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from "../components/CharacterComponent";
import { setupMaterials } from "../functions/setupMaterials";

export const initializeCharacter: Behavior = (entity): void => {	
	// console.warn("Initializing character for ", entity.id);
	if (!hasComponent(entity, CharacterComponent as any)){
		console.warn("Character does not have a character component, adding");
		addComponent(entity, CharacterComponent as any);
	} else {
		// console.warn("Character already had a character component, not adding, but we should handle")
	}

	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.mixer?.stopAllAction();

	// forget that we have any animation playing
	actor.currentAnimationAction = null;

	// clear current avatar mesh
	if(actor.modelContainer !== undefined)
	  ([ ...actor.modelContainer.children ])
		.forEach(child => actor.modelContainer.remove(child));
	const stateComponent = getComponent(entity, State);
	// trigger all states to restart?
	stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);

	// The visuals group is centered for easy actor tilting
	actor.tiltContainer = new Group();
	actor.tiltContainer.name = 'Actor (tiltContainer)'+entity.id;

	// // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
	actor.modelContainer = new Group();
	actor.modelContainer.name = 'Actor (modelContainer)'+entity.id;
	actor.modelContainer.position.y = -actor.rayCastLength;
	actor.tiltContainer.add(actor.modelContainer);

	// by default all asset childs are moved into entity object3dComponent, which is tiltContainer
	// we should keep it clean till asset loaded and all it's content moved into modelContainer
	addObject3DComponent(entity, { obj3d: actor.tiltContainer });

	if(isClient){

		// const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader as any);
		// assetLoader.parent = actor.modelContainer;
		// assetLoader.onLoaded = (entity, { asset }) => {
			AnimationManager.instance.getAnimations().then(animations => {
				actor.animations = animations;
			});
		}

	// actor.mixer = new AnimationMixer(actor.modelContainer);
	// actor.mixer.timeScale = actor.animationsTimeScale;


	actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

	actor.viewVector = new Vector3();

	const transform = getComponent(entity, TransformComponent);

	// Physics
	// Player Capsule
	addComponent(entity, CapsuleCollider, {
		mass: actor.actorMass,
		position: new Vec3( ...transform.position.toArray() ), // actor.capsulePosition ?
		height: actor.actorHeight,
		radius: actor.capsuleRadius,
		segments: actor.capsuleSegments,
		friction: actor.capsuleFriction
	});

	actor.actorCapsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider);
	actor.actorCapsule.body.shapes.forEach((shape) => {
		shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
	});
	actor.actorCapsule.body.allowSleep = false;
	//actor.actorCapsule.body.position = new Vec3(0, 1, 0);
	// Move actor to different collision group for raycasting
	actor.actorCapsule.body.collisionFilterGroup = 2;

	// Disable actor rotation
	actor.actorCapsule.body.fixedRotation = true;
	actor.actorCapsule.body.updateMassProperties();

	// If this entity has an object3d, get the position of that
	// if(hasComponent(entity, Object3DComponent)){
	// 	actor.actorCapsule.body.position = cannonFromThreeVector(getComponent<Object3DComponent>(entity, Object3DComponent).value.position)
	//   } else {
	//	actor.actorCapsule.body.position = new Vec3()
	//   }

	// Ray cast debug
	const boxGeo = new BoxGeometry(0.1, 0.1, 0.1);
	const boxMat = new MeshLambertMaterial({
		color: 0xff0000
	});
	actor.raycastBox = new Mesh(boxGeo, boxMat);
	//actor.raycastBox.visible = true;
	//Engine.scene.add(actor.raycastBox);
	PhysicsSystem.physicsWorld.addBody(actor.actorCapsule.body);

	// Physics pre/post step callback bindings
	// States
	addState(entity, { state: CharacterStateTypes.IDLE });
	actor.initialized = true;

	// };
};
