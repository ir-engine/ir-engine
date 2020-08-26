import { Vec3 } from "cannon-es";
import { AnimationMixer, BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Behavior } from "../../../common/interfaces/Behavior";
import { addComponent, getMutableComponent, hasComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { CapsuleCollider } from "../../../physics/components/CapsuleCollider";
import { RelativeSpringSimulator } from "../../../physics/components/RelativeSpringSimulator";
import { VectorSpringSimulator } from "../../../physics/components/VectorSpringSimulator";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { addState } from "../../../state/behaviors/StateBehaviors";
import { CharacterComponent } from "../components/CharacterComponent";
import { IdleState } from "../states/IdleState";
import { physicsPreStep } from "./physicsPreStep";
import { physicsPostStep } from "./physicsPostStep";
import { Body } from "cannon-es"
import { State } from "../../../state/components/State";
import { CharacterStateTypes } from "../CharacterStateTypes";

export const initializeCharacter: Behavior = (entity): void => {
	console.log("Initializing actor!");
	if (!hasComponent(entity, CharacterComponent as any))
		addComponent(entity, CharacterComponent as any);
	const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader as any);

	assetLoader.onLoaded = asset => {
		const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
		actor.animations = asset.animations;

		// The visuals group is centered for easy actor tilting
		actor.tiltContainer = new Group();
		const actorObject3D = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
		actorObject3D.value.add(actor.tiltContainer);

		// Model container is used to reliably ground the actor, as animation can alter the position of the model itself
		actor.modelContainer = new Group();
		actor.modelContainer.position.y = -0.57;
		actor.tiltContainer.add(actor.modelContainer);
		actor.modelContainer.add(asset.scene);

		actor.mixer = new AnimationMixer(asset.scene);

		actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
		actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

		actor.viewVector = new Vector3();

		// Physics
		// Player Capsule
		actor.actorCapsule = new CapsuleCollider({
			mass: 1,
			position: new Vec3(),
			actor_height: 0.5,
			radius: 0.25,
			segments: 8,
			friction: 0.0,
			body: {
				preStep: (body: Body) => { physicsPreStep(entity, { body: body } ) },
				postStep: (body: Body) => { physicsPostStep(entity, { body: body }) }
			}
		});
		console.log("capsule")
		console.log(actor.actorCapsule)
		// capsulePhysics.physical.collisionFilterMask = ~CollisionGroups.Trimesh;
		actor.actorCapsule.body.shapes.forEach((shape) => {
			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
		});
		actor.actorCapsule.body.allowSleep = false;

		// Move actor to different collision group for raycasting
		actor.actorCapsule.body.collisionFilterGroup = 2;

		// Disable actor rotation
		actor.actorCapsule.body.fixedRotation = true;
		actor.actorCapsule.body.updateMassProperties();

		// Ray cast debug
		const boxGeo = new BoxGeometry(0.1, 0.1, 0.1);
		const boxMat = new MeshLambertMaterial({
			color: 0xff0000
		});
		actor.raycastBox = new Mesh(boxGeo, boxMat);
		actor.raycastBox.visible = true;

		// Physics pre/post step callback bindings
		// States
		addState(entity, { state: CharacterStateTypes.IDLE });
		actor.initialized = true;
		console.log("State values")
		console.log(getComponent(entity, State).data.values())
	};
};
