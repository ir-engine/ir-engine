import { DEFAULT_AVATAR_ID } from "@xrengine/common/src/constants/AvatarConstants";
import { AnimationMixer, Group, Quaternion, Vector3 } from "three";
import { Controller } from 'three-physx';
import { AssetLoader } from "../../assets/classes/AssetLoader";
import { PositionalAudioComponent } from "../../audio/components/PositionalAudioComponent";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../camera/types/CameraModes";
import { isClient } from "../../common/functions/isClient";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Interactor } from "../../interaction/components/Interactor";
import { Network } from "../../networking/classes/Network";
import { initializeNetworkObject } from "../../networking/functions/initializeNetworkObject";
import { NetworkPrefab } from "../../networking/interfaces/NetworkPrefab";
import { PrefabType } from "../../networking/templates/PrefabType";
import { RelativeSpringSimulator } from "../../physics/classes/SpringSimulator";
import { VectorSpringSimulator } from "../../physics/classes/VectorSpringSimulator";
import { InterpolationComponent } from "../../physics/components/InterpolationComponent";
import { CollisionGroups, DefaultCollisionMask } from "../../physics/enums/CollisionGroups";

import { PhysicsSystem } from "../../physics/systems/PhysicsSystem";
import { addObject3DComponent } from "../../scene/behaviors/addObject3DComponent";
import { createShadow } from "../../scene/behaviors/createShadow";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { AnimationManager } from "../AnimationManager";
import { getMovementValues, initializeMovingState, movingAnimationSchema } from "../animations/MovingAnimations";
import { CharacterInputSchema } from '../CharacterInputSchema';
import { AnimationComponent } from "../components/AnimationComponent";
import { CharacterComponent } from '../components/CharacterComponent';
import { ControllerColliderComponent } from "../components/ControllerColliderComponent";
import { NamePlateComponent } from '../components/NamePlateComponent';
import { PersistTagComponent } from "../../scene/components/PersistTagComponent";
import { IKRigComponent } from "../components/IKRigComponent";
import { PortalProps } from "../../scene/behaviors/createPortal";


export const loadDefaultActorAvatar: Behavior = (entity) => {
  if(!isClient) return;
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  AnimationManager.instance._defaultModel?.children?.forEach(child => actor.modelContainer.add(child));
  actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
	if (hasComponent(entity, IKRigComponent)) {
    removeComponent(entity, IKRigComponent)
    addComponent(entity, IKRigComponent)
	}
}

export const loadActorAvatar: Behavior = (entity) => {
	if (!isClient) return;
	const avatarURL = getComponent(entity, CharacterComponent)?.avatarURL;
	if (avatarURL) {
		loadActorAvatarFromURL(entity, avatarURL);
	}
};

export const loadActorAvatarFromURL: Behavior = (entity, avatarURL) => {
  if(!isClient) return;
	const tmpGroup = new Group();
	console.log("Loading Actor Avatar =>", avatarURL)

	createShadow(entity, { castShadow: true, receiveShadow: true });

	AssetLoader.load({
		url: avatarURL,
		entity,
		castShadow: true,
		receiveShadow: true,
		parent: tmpGroup,
	}, () => {
		const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
		const controller = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
		if (!actor) return

		actor.mixer && actor.mixer.stopAllAction();
		// forget that we have any animation playing
		actor.currentAnimationAction = [];

		// clear current avatar mesh
		([...actor.modelContainer.children])
			.forEach(child => actor.modelContainer.remove(child));

		let targetSkeleton;
		tmpGroup.traverse((child) => {
			if (child.type === "SkinnedMesh") {
				if (!targetSkeleton)
					targetSkeleton = child;
			}
		})

		tmpGroup.children.forEach(child => actor.modelContainer.add(child));
		// const geom = getGeometry(actor.modelContainer);
		// if (geom) {
		// 	geom.computeBoundingBox()
		// 	const modelX = (geom.boundingBox.max.x - geom.boundingBox.min.x) / 2;
		// 	const modelY = (geom.boundingBox.max.y - geom.boundingBox.min.y) / 2;
		// 	const modelZ = (geom.boundingBox.max.z - geom.boundingBox.min.z) / 2;
		//controller.controller.resize(modelHeight - (modelWidth*2));
		// const modelSize = modelX + modelY + modelZ;
		// if (!modelSize) return;

		// TODO: controller size should be calculated entirely from the model bounds, not relying to constants & tweaking

		// instead, set model to IDLE state, then calculate total bounds and resize

		// const modelWidth = ((modelX * actor.modelScaleWidth.x) + (modelY * actor.modelScaleWidth.y) + (modelZ * actor.modelScaleWidth.z));
		// const modelHeight = ((modelX * actor.modelScaleHeight.x) + (modelY * actor.modelScaleHeight.y) + (modelZ * actor.modelScaleHeight.z)) / (modelSize * actor.modelScaleFactor.size);
		// const height = modelHeight * actor.modelScaleFactor.height;
		// const width = modelWidth * actor.modelScaleFactor.radius;
		// }
		actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
		if (hasComponent(entity, IKRigComponent)) {
			removeComponent(entity, IKRigComponent)
			addComponent(entity, IKRigComponent)
		}
	});
};

const initializeCharacter: Behavior = (entity): void => {
	console.warn("Initializing character");
	entity.name = 'Player';

	if (!hasComponent(entity, CharacterComponent as any)) {
		console.warn("Character does not have a character component, adding");
		addComponent(entity, CharacterComponent as any);
	} else {
		// console.warn("Character already had a character component, not adding, but we should handle")
	}

	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.mixer?.stopAllAction();

	// forget that we have any animation playing
	actor.currentAnimationAction = [];

	// clear current avatar mesh
	if (actor.modelContainer !== undefined)
		([...actor.modelContainer.children])
			.forEach(child => actor.modelContainer.remove(child));
	// const stateComponent = getComponent(entity, State);
	// trigger all states to restart?
	// stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);

	// The visuals group is centered for easy actor tilting
	actor.tiltContainer = new Group();
	actor.tiltContainer.name = 'Actor (tiltContainer)' + entity.id;

	// // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
	actor.modelContainer = new Group();
	actor.modelContainer.name = 'Actor (modelContainer)' + entity.id;
	actor.modelContainer.position.y = -actor.rayCastLength;
	actor.tiltContainer.add(actor.modelContainer);

	// by default all asset childs are moved into entity object3dComponent, which is tiltContainer
	// we should keep it clean till asset loaded and all it's content moved into modelContainer
	addObject3DComponent(entity, { obj3d: actor.tiltContainer });

	actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.moveVectorSmooth = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.animationVectorSimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

	if (actor.viewVector == null) actor.viewVector = new Vector3();

	const transform = getComponent(entity, TransformComponent);

  addComponent(entity, ControllerColliderComponent, {
		mass: actor.actorMass,
		position: transform.position,
		height: actor.actorHeight,
		radius: actor.capsuleRadius,
		// contactOffset: actor.contactOffset,
		segments: actor.capsuleSegments,
		friction: actor.capsuleFriction,
  })
  addColliderToCharacter(entity)

	// collider.controller.updateTransform({ translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }})
	actor.initialized = true;
	initializeMovingState(entity);
	// };
};

export const addColliderToCharacter = (playerEntity: Entity) => {
  
  const playerCollider = getMutableComponent(playerEntity, ControllerColliderComponent)
	const actor = getComponent(playerEntity, CharacterComponent);

	const transform = getComponent(playerEntity, TransformComponent);
  
	playerCollider.controller = PhysicsSystem.instance.createController(new Controller({
    isCapsule: true,
    collisionLayer: CollisionGroups.Characters,
    collisionMask: DefaultCollisionMask,
    height: actor.actorHeight,
    contactOffset: actor.contactOffset,
    stepOffset: 0.25,
    radius: actor.capsuleRadius,
    position: {
      x: transform.position.x,
      y: transform.position.y + 2,
      z: transform.position.z
    },
    material: {
      dynamicFriction: actor.capsuleFriction,
    }
  }))
}

export const onPlayerSpawnInNewLocation = (portalProps: PortalProps) => {
  addColliderToCharacter(Network.instance.localClientEntity)
  teleportPlayer(Network.instance.localClientEntity, portalProps.spawnPosition, portalProps.spawnRotation)
}

export const teleportPlayer = (playerEntity: Entity, position: Vector3, rotation: Quaternion) => {
  const playerCollider = getMutableComponent(playerEntity, ControllerColliderComponent)
  position.y = playerCollider.controller.transform.translation.y;
  playerCollider.controller.updateTransform({
    translation: position,
    rotation,
  });
}

export function createNetworkPlayer(args: { ownerId: string | number, networkId?: number, entity?: Entity }) {
	const networkComponent = initializeNetworkObject({
		ownerId: String(args.ownerId),
		uniqueId: String(args.ownerId),
		networkId: args.networkId,
		prefabType: PrefabType.Player,
		override: {
			localClientComponents: [],
			networkComponents: [
				{
					type: TransformComponent,
					data: {
						position: new Vector3(),
						rotation: new Quaternion()
					}
				},
				{
					type: CharacterComponent,
					data: Network.instance.clients[args.ownerId]?.avatarDetail ?? {},
				}
			],
			serverComponents: []
		}
	}
	);
  if (!isClient) {
    Network.instance.worldState.createObjects.push({
        networkId: networkComponent.networkId,
        ownerId: networkComponent.ownerId,
        prefabType: PrefabType.Player,
        uniqueId: networkComponent.uniqueId,
        parameters: ''
    });
  }
	return networkComponent;
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  initialize: createNetworkPlayer,
	// These will be created for all players on the network
	networkComponents: [
		// ActorComponent has values like movement speed, deceleration, jump height, etc
		{ type: CharacterComponent, data: { avatarId: DEFAULT_AVATAR_ID || 'default' } }, // TODO: add to environment
		// Transform system applies values from transform component to three.js object (position, rotation, etc)
		{ type: TransformComponent },
		// Local player input mapped to behaviors in the input map
		{ type: Input, data: { schema: CharacterInputSchema } },
		{ type: NamePlateComponent },
		{ type: PositionalAudioComponent }
	],
	// These are only created for the local player who owns this prefab
	localClientComponents: [
		{ type: LocalInputReceiver },
		{ type: FollowCameraComponent, data: { distance: 3, mode: CameraModes.ThirdPerson } },
		{ type: Interactor },
		{ type: PersistTagComponent }
	],
	clientComponents: [
		// Its component is a pass to Interpolation for Other Players and Serrver Correction for Your Local Player
		{ type: InterpolationComponent },
		{ type: AnimationComponent, data: { animationsSchema: movingAnimationSchema, updateAnimationsValues: getMovementValues } }
	],
	serverComponents: [],
	onAfterCreate: [
		{
			behavior: initializeCharacter,
			networked: true
		},
		{
			behavior: loadDefaultActorAvatar,
			networked: true
		},
		{
			behavior: loadActorAvatar,
			networked: true
		}

	],
	onBeforeDestroy: [

	]
};
