import { LifecycleValue } from "@xr3ngine/engine/src/common/enums/LifecycleValue";
import { isClient } from "@xr3ngine/engine/src/common/functions/isClient";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { addObject3DComponent } from "@xr3ngine/engine/src/scene/behaviors/addObject3DComponent";
import { Vec3 } from "cannon-es";
import { AnimationClip, AnimationMixer, BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3 } from "three";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { AssetLoaderState } from "../../../assets/components/AssetLoaderState";
import { GLTFLoader } from "../../../assets/loaders/gltf/GLTFLoader";
import { PositionalAudioComponent } from '../../../audio/components/PositionalAudioComponent';
import { FollowCameraComponent } from '../../../camera/components/FollowCameraComponent';
import { CameraModes } from '../../../camera/types/CameraModes';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from '../../../input/components/Input';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
import { Interactor } from '../../../interaction/components/Interactor';
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { RelativeSpringSimulator } from "../../../physics/classes/SpringSimulator";
import { VectorSpringSimulator } from "../../../physics/classes/VectorSpringSimulator";
import { CapsuleCollider } from "../../../physics/components/CapsuleCollider";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { PhysicsSystem } from "../../../physics/systems/PhysicsSystem";
import { createShadow } from "../../../scene/behaviors/createShadow";
import TeleportToSpawnPoint from '../../../scene/components/TeleportToSpawnPoint';
import { setState } from "../../../state/behaviors/setState";
import { State } from '../../../state/components/State';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { CharacterAvatars, DEFAULT_AVATAR_ID } from "../CharacterAvatars";
import { CharacterInputSchema } from '../CharacterInputSchema';
import { CharacterStateSchema } from '../CharacterStateSchema';
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { NamePlateComponent } from '../components/NamePlateComponent';

export class AnimationManager {
	static instance: AnimationManager = new AnimationManager();
	public initialized = false

	_animations: AnimationClip[] = []
	getAnimations(): Promise<AnimationClip[]> {
		return new Promise(resolve => {
			if (!isClient) {
				resolve([]);
				return;
			}

			new GLTFLoader().load('/models/avatars/Animation.glb', gltf => {
					this._animations = gltf.animations;
					this._animations?.forEach(clip => {
						// TODO: make list of morph targets names
						clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
					});
					resolve(this._animations);
				}
			);
		});
	}

	constructor () {
		this.getAnimations();
	}
}

export const loadActorAvatar: Behavior = (entity) => {
  const avatarId: string = getComponent(entity, CharacterComponent)?.avatarId;
  const avatarSource = CharacterAvatars.find(avatarData => avatarData.id === avatarId)?.src;
  if(!avatarId || !avatarSource) {
    console.error('loadActorAvatar: Could not load avatar!', entity, avatarId, avatarSource);
  }

  if (hasComponent(entity, AssetLoader)) removeComponent(entity, AssetLoader, true);
  if (hasComponent(entity, AssetLoaderState)) removeComponent(entity, AssetLoaderState, true);

  const tmpGroup = new Group();
  addComponent(entity, AssetLoader, {
    url: avatarSource,
    receiveShadow: true,
    castShadow: true,
    parent: tmpGroup,
  });
  createShadow(entity, { objArgs: { castShadow: true, receiveShadow: true }})
  const loader = getComponent(entity, AssetLoader);
  loader.onLoaded.push(async (entity, args) => {
    // console.log("Actor Avatar loaded")
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    actor.mixer && actor.mixer.stopAllAction();
    // forget that we have any animation playing
    actor.currentAnimationAction = [];

    // clear current avatar mesh
    ([...actor.modelContainer.children])
      .forEach(child => actor.modelContainer.remove(child));

    tmpGroup.children.forEach(child => actor.modelContainer.add(child));

    actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
	// TODO: Remove this. Currently we are double-sampling the samplerate
	actor.mixer.timeScale = 0.5;
    
    const stateComponent = getComponent(entity, State);
    // trigger all states to restart?
    stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
  })
};

const initializeCharacter: Behavior = (entity): void => {	
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
	actor.currentAnimationAction = [];

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
			AnimationManager.instance.getAnimations().then(animations => {
				actor.animations = animations;
			});
		}

	actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

	if(actor.viewVector == null) actor.viewVector = new Vector3();

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
	//actor.raycastBox.visible = true;
	//Engine.scene.add(actor.raycastBox);
	PhysicsSystem.physicsWorld.addBody(actor.actorCapsule.body);

	// Physics pre/post step callback bindings
	// States
	setState(entity, { state: CharacterStateTypes.DEFAULT });
	actor.initialized = true;

	// };
};

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // ActorComponent has values like movement speed, deceleration, jump height, etc
    { type: CharacterComponent },
    // Handle character's body
    { type: CharacterComponent, data: { avatarId: DEFAULT_AVATAR_ID }},
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    // Local player input mapped to behaviors in the input map
    { type: Input, data: { schema: CharacterInputSchema } },
    // Current state (isJumping, isidle, etc)
    { type: State, data: { schema: CharacterStateSchema } },
    { type: NamePlateComponent },
    { type: PositionalAudioComponent }
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [
    { type: LocalInputReceiver },
    { type: FollowCameraComponent, data: { distance: 3, mode: CameraModes.ThirdPerson } },
    { type: Interactor }
  
  ],
  serverComponents: [
    { type: TeleportToSpawnPoint },
  ],
  onAfterCreate: [
    {
      behavior: initializeCharacter,
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
