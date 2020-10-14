import { Vec3 } from "cannon-es";
import { AnimationMixer, BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { Behavior } from "../../../common/interfaces/Behavior";
import { addComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { CapsuleCollider } from "../../../physics/components/CapsuleCollider";
import { RelativeSpringSimulator } from "../../../physics/classes/RelativeSpringSimulator";
import { VectorSpringSimulator } from "../../../physics/classes/VectorSpringSimulator";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { addState } from "../../../state/behaviors/StateBehaviors";
import { CharacterComponent } from "../components/CharacterComponent";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { Engine } from "../../../ecs/classes/Engine";
import { PhysicsManager } from "../../../physics/components/PhysicsManager";
import { AnimationManager } from "@xr3ngine/engine/src/templates/character/components/AnimationManager";
import { addObject3DComponent } from "../../../common/behaviors/Object3DBehaviors";

export const initializeCharacter: Behavior = (entity): void => {
	console.log("Init character");
	console.log("**** Initializing character!");
	if (!hasComponent(entity, CharacterComponent as any))
		addComponent(entity, CharacterComponent as any);


	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	// The visuals group is centered for easy actor tilting
	actor.tiltContainer = new Group();
	actor.tiltContainer.name = 'Actor (tiltContainer)';

	// // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
	actor.modelContainer = new Group();
	actor.modelContainer.name = 'Actor (modelContainer)';
	actor.modelContainer.position.y = -actor.rayCastLength;
	actor.tiltContainer.add(actor.modelContainer);

	// by default all asset childs are moved into entity object3dComponent, which is tiltContainer
	// we should keep it clean till asset loaded and all it's content moved into modelContainer
	addObject3DComponent(entity, { obj3d: actor.tiltContainer });

	const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader as any);
	assetLoader.parent = actor.modelContainer;
	assetLoader.onLoaded = (entity, { asset }) => {
		actor.animations = AnimationManager.instance.animations;

		console.log("Components on character");
		console.log(entity.components);

		actor.mixer = new AnimationMixer(actor.modelContainer);
		actor.mixer.timeScale = 0.7;


		actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
		actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

		actor.viewVector = new Vector3();

		// Physics
		// Player Capsule
		addComponent(entity, CapsuleCollider as any, {
			mass: 1,
			position: new Vec3(),
			actor_height: 1,
			radius: 0.25,
			segments: 8,
			friction: 0.0
		});
		actor.actorCapsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider);
		actor.actorCapsule.body.shapes.forEach((shape) => {
			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
		});
		actor.actorCapsule.body.allowSleep = false;
		actor.actorCapsule.body.position = new Vec3(0,1,0);
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
		actor.raycastBox.visible = true;
		Engine.scene.add(actor.raycastBox);
		PhysicsManager.instance.physicsWorld.addBody(actor.actorCapsule.body);

		// Physics pre/post step callback bindings
		// States
		addState(entity, { state: CharacterStateTypes.IDLE });
		actor.initialized = true;

	};
};
