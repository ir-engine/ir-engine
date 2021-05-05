import { isClient } from '../../../common/functions/isClient';
import { Entity } from '../../../ecs/classes/Entity';
import { Behavior } from "../../../common/interfaces/Behavior";
import { addObject3DComponent } from "../../../scene/behaviors/addObject3DComponent";
import { initializeNetworkObject } from '../../../networking/functions/initializeNetworkObject'
import { Network } from '../../../networking/classes/Network';
import { AnimationClip, AnimationMixer, BoxGeometry, Group, Material, Mesh, MeshLambertMaterial, Object3D, Quaternion, Skeleton, SkeletonHelper, SkinnedMesh, Vector3 } from "three";
import { AssetLoader } from "../../../assets/classes/AssetLoader";
import { PositionalAudioComponent } from '../../../audio/components/PositionalAudioComponent';
import { FollowCameraComponent } from '../../../camera/components/FollowCameraComponent';
import { CameraModes } from '../../../camera/types/CameraModes';
import { addComponent, getComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from '../../../input/components/Input';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
import { Interactor } from '../../../interaction/components/Interactor';
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { RelativeSpringSimulator } from "../../../physics/classes/SpringSimulator";
import { VectorSpringSimulator } from "../../../physics/classes/VectorSpringSimulator";
import { ControllerColliderComponent } from "../../../physics/components/ControllerColliderComponent";
import { InterpolationComponent } from "../../../physics/components/InterpolationComponent";
import { PhysicsSystem } from "../../../physics/systems/PhysicsSystem";
import { createShadow } from "../../../scene/behaviors/createShadow";
import TeleportToSpawnPoint from '../../../scene/components/TeleportToSpawnPoint';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { CharacterInputSchema } from '../CharacterInputSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { NamePlateComponent } from '../components/NamePlateComponent';
import { getLoader } from "../../../assets/functions/LoadGLTF";
import { DEFAULT_AVATAR_ID } from "@xr3ngine/common/src/constants/AvatarConstants";
import { Engine } from "../../../ecs/classes/Engine";
import { PrefabType } from "../../networking/PrefabType";
import { initializeMovingState } from "../animations/MovingAnimations";
import { IKComponent } from '../components/IKComponent';
import { initiateIK } from "../../../xr/functions/IKFunctions";
import { AnimationComponent } from "../components/AnimationComponent";
import { CollisionGroups } from '../../../physics/enums/CollisionGroups';
import { InterpolationInterface } from '../../../physics/interfaces/InterpolationInterface';
import { characterCorrectionBehavior } from '../behaviors/characterCorrectionBehavior';
import { characterInterpolationBehavior } from '../behaviors/characterInterpolationBehavior';
import { Controller } from 'three-physx';
import { SkeletonUtils } from '../../../assets/threejs-various/SkeletonUtils.js';
import { standardizeSkeletion } from '../functions/standardizeSkeleton';

export class AnimationManager {
	static instance: AnimationManager = new AnimationManager();

	_animations: AnimationClip[];
  _defaultModel: Group;
  _defaultSkeleton: SkinnedMesh;

	getAnimations(): Promise<AnimationClip[]> {
		return new Promise(resolve => {
			if (!isClient) {
				resolve([]);
				return;
			}
      if(this._animations) {
        resolve(this._animations);
        return;
      }
			getLoader().load(Engine.publicPath + '/models/avatars/AvatarAnimations.glb', gltf => {
        gltf.scene.traverse((child) => {
          if(child.type === "SkinnedMesh" && !this._defaultSkeleton) {
            this._defaultSkeleton = child;
          }
        })

        //standardizeSkeletion(this._defaultSkeleton);
        this._animations = gltf.animations;
				this._animations?.forEach(clip => {
					// TODO: make list of morph targets names
					clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
           //console.log(clip)
				});
				resolve(this._animations);
			});
		});
	}
	getDefaultModel(): Promise<Group> {
		return new Promise(resolve => {
      if(this._defaultModel) {
        resolve(this._defaultModel);
        return;
      }
			getLoader().load(Engine.publicPath + '/models/avatars/Default.glb', gltf => {
        console.log('default model loaded')
        this._defaultModel = gltf.scene;
        this._defaultModel.traverse((obj: Mesh) => {
          if(obj.material) {
            (obj.material as Material).transparent = true;
            (obj.material as Material).opacity = 0.5;
          }
        })
        resolve(this._defaultModel);
      });
		});
	}


  retargetBones():Promise<any>{
    console.log("Retargeting Stuff");
    return;
  }
}

export const loadDefaultActorAvatar: Behavior = (entity) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  AnimationManager.instance._defaultModel?.children?.forEach(child => actor.modelContainer.add(child));
  actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
  if(hasComponent(entity, IKComponent)) {
    initiateIK(entity)
  }
}

export const loadActorAvatar: Behavior = (entity) => {
  console.log("Loading Actor Avatar")

	const avatarURL = getComponent(entity, CharacterComponent)?.avatarURL;
	if (avatarURL) {
		loadActorAvatarFromURL(entity, avatarURL);
	}
};

export const loadActorAvatarFromURL: Behavior = (entity, avatarURL) => {
	const tmpGroup = new Group();
  console.log("Loading Actor Avatar")

	createShadow(entity, { objArgs: { castShadow: true, receiveShadow: true } })

	AssetLoader.load({
		url: avatarURL,
		entity,
		castShadow: true,
		receiveShadow: true,
		parent: tmpGroup,
	}, () => {
		const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    if(!actor) return

    actor.mixer && actor.mixer.stopAllAction();
    // forget that we have any animation playing
    actor.currentAnimationAction = [];
    
    // clear current avatar mesh
    ([...actor.modelContainer.children])
      .forEach(child => actor.modelContainer.remove(child));

    //This is for animation retargetting
    let targetSkeleton;
    tmpGroup.traverse((child) => {
      if(child.type === "SkinnedMesh") {
        if(!targetSkeleton)
        targetSkeleton = child;
      }
    })

    // standardizeSkeletion(targetSkeleton);


		tmpGroup.children.forEach(child => actor.modelContainer.add(child));
    console.log("Loading Actor from the Url")
    console.log(actor.modelContainer)
		actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
		if (hasComponent(entity, IKComponent)) {
			initiateIK(entity)
		}
	});
};

const initializeCharacter: Behavior = (entity): void => {
	console.warn("Initializing character");



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
	// const stateComponent = getComponent(entity, State);
	// trigger all states to restart?
	// stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);

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
    AnimationManager.instance.getAnimations().then(() => {
      actor.animations = AnimationManager.instance._animations;
    })
	}

	actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.moveVectorSmooth = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.animationVectorSimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

	if(actor.viewVector == null) actor.viewVector = new Vector3();

	const transform = getComponent(entity, TransformComponent);

	// Physics
	// Player Capsule
	addComponent(entity, ControllerColliderComponent, {
		mass: actor.actorMass,
		position: transform.position,
		height: actor.actorHeight,
		radius: actor.capsuleRadius,
		segments: actor.capsuleSegments,
		friction: actor.capsuleFriction
	});

	actor.actorCapsule = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);

	// Physics pre/post step callback bindings
	// States
	// setState(entity, { state: CharacterAnimations.DEFAULT });
	actor.initialized = true;

  addComponent(entity, AnimationComponent);

  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  collider.controller = PhysicsSystem.instance.createController(new Controller({
    isCapsule: true,
    collisionLayer: CollisionGroups.Characters,
    collisionMask: CollisionGroups.All,//CollisionGroups.Default | CollisionGroups.Characters | CollisionGroups.Car | CollisionGroups.TrimeshColliders,
    position: {
      x: transform.position.x,
      y: transform.position.y + 1,
      z: transform.position.z
    },
    material: {
      dynamicFriction: collider.friction,
    }
  }));
  // collider.controller.updateTransform({ translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }})

  initializeMovingState(entity)

	// };
};

export function createNetworkPlayer( args:{ ownerId: string | number, networkId?: number, entity?: Entity } ) {
	/*
  let position = null;
  let rotation = null;
  if (typeof obj.x === 'number' || typeof obj.y === 'number' || typeof obj.z === 'number' ) {
      position = new Vector3(obj.x, obj.y, obj.z);
  }
  if (typeof obj.qX === 'number' || typeof obj.qY === 'number' || typeof obj.qZ === 'number' || typeof obj.qW === 'number') {
      rotation = new Quaternion(obj.qX, obj.qY, obj.qZ, obj.qW);
  }
	*/
  const networkComponent = initializeNetworkObject({
    ownerId: String(args.ownerId),
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
	          data: Network.instance.clients[args.ownerId].avatarDetail ?? {},
	        }
	      ],
	      serverComponents: []
	    }
		}
  );
	return networkComponent;
}

export const characterInterpolationSchema: InterpolationInterface = {
  interpolationBehavior: characterInterpolationBehavior,
  serverCorrectionBehavior: characterCorrectionBehavior
}


// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // ActorComponent has values like movement speed, deceleration, jump height, etc
    { type: CharacterComponent, data: { avatarId: DEFAULT_AVATAR_ID || 'Allison' }}, // TODO: add to environment
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
    { type: Interactor }
  ],
	clientComponents: [
		// Its component is a pass to Interpolation for Other Players and Serrver Correction for Your Local Player
		{ type: InterpolationComponent, data: { schema: characterInterpolationSchema } }
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
