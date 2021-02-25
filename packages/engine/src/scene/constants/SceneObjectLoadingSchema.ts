import { isServer } from '@xr3ngine/engine/src/common/functions/isServer';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { getComponent, removeEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';
import { ColliderComponent } from '@xr3ngine/engine/src/physics/components/ColliderComponent';
import { RigidBody } from '@xr3ngine/engine/src/physics/components/RigidBody';
import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { PrefabType } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { AmbientLight, CircleBufferGeometry, Color, HemisphereLight, Mesh, MeshPhongMaterial, PointLight, SpotLight, Vector3 } from 'three';
import { AssetLoader } from '../../assets/components/AssetLoader';
import { isClient } from "../../common/functions/isClient";
import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { ComponentConstructor } from "../../ecs/interfaces/ComponentInterfaces";
import { Input } from '../../input/components/Input';
import { Interactable } from '../../interaction/components/Interactable';
import { Network } from '../../networking/classes/Network';
import { createParticleEmitter } from '../../particles/functions/particleHelpers';
import { onInteractionHover } from '../../templates/interactive/functions/commonInteractive';
import { getInCar } from '../../templates/vehicle/behaviors/getInCarBehavior';
import { getInCarPossible } from '../../templates/vehicle/behaviors/getInCarPossible';
import { VehicleInputSchema } from '../../templates/vehicle/VehicleInputSchema';
import { addObject3DComponent } from '../behaviors/addObject3DComponent';
import { createBackground } from '../behaviors/createBackground';
import { createBoxCollider } from '../behaviors/createBoxCollider';
import { createCommonInteractive } from "../behaviors/createCommonInteractive";
import { createGroup } from '../behaviors/createGroup';
import { createImage } from '../behaviors/createImage';
import { createMedia, createMediaServer } from "../behaviors/createMedia";
import { createScenePreviewCamera } from "../behaviors/createScenePreviewCamera";
import { createShadow } from '../behaviors/createShadow';
import createSkybox from '../behaviors/createSkybox';
import { createTransformComponent } from "../behaviors/createTransformComponent";
import { createTriggerVolume } from '../behaviors/createTriggerVolume';
import { createVolumetric } from "../behaviors/createVolumetric";
import { handleAudioSettings } from '../behaviors/handleAudioSettings';
import { setFog } from '../behaviors/setFog';
import CollidableTagComponent from '../components/Collidable';
import { LightTagComponent, VisibleTagComponent } from '../components/Object3DTagComponents';
import ScenePreviewCameraTagComponent from "../components/ScenePreviewCamera";
import SpawnPointComponent from "../components/SpawnPointComponent";
import WalkableTagComponent from '../components/Walkable';
import { LoadingSchema } from '../interfaces/LoadingSchema';

function castShadowOn(group) {
  group.children.forEach(children => {
    if (children.type == 'Mesh') {
      children.castShadow = true;
    }
  })
}

const parseCarModel: Behavior = (entity: Entity, groupMeshes: any) => {
  const deleteArr = [];
  const argsToVehicle = {
    vehicleMesh: null,
    vehicleCollider: null,
    vehicleDoorsArray: [],
    seatsArray: [],
    entrancesArray: [],
    arrayWheelsPosition: [],
    arrayWheelsMesh: [],
    vehicleSphereColliders: [],
    suspensionRestLength: 0,
    mass: 0,
    startPosition: [
      groupMeshes.position.x,
      groupMeshes.position.y,
      groupMeshes.position.z
    ]
  };
  // copy position from editor position model
  groupMeshes.position.set(0, 0, 0);
  // Parse Meshes to functionality parts
  groupMeshes.traverse(mesh => {
    // add optimized shadow
    isClient && mesh.userData.data === 'castShadow' ? castShadowOn(mesh) : '';
    // parse meshes to functionality parts of car
    switch (mesh.name) {
      case 'body':
        isClient ? argsToVehicle.vehicleMesh = mesh:'';
        // @ts-ignore
        mesh.userData.mass != undefined ? argsToVehicle.mass = parseFloat(mesh.userData.mass) : '';
        break;

      case 'door_front_left':
      case 'door_front_right':
        argsToVehicle.vehicleDoorsArray.push(mesh);
        getMutableComponent(entity, Interactable).interactionPartsPosition.push([mesh.position.x, mesh.position.y, mesh.position.z]);
        break;

      case 'collider':
        argsToVehicle.vehicleCollider = mesh;
        deleteArr.push(mesh);
        break;

      case 'seat_front_left':
      case 'seat_front_right':
        argsToVehicle.seatsArray.push([mesh.position.x, mesh.position.y, mesh.position.z]);
        break;

      case 'entrance_front_left':
      case 'entrance_front_right':
        argsToVehicle.entrancesArray.push([mesh.position.x, mesh.position.y, mesh.position.z]);
        break;

      case 'wheel_front_left':
      case 'wheel_front_right':
      case 'wheel_rear_left':
      case 'wheel_rear_right':
        const clonedMesh = mesh.clone();
        deleteArr.push(mesh);
        argsToVehicle.arrayWheelsPosition.push(new Vector3().copy(mesh.position));
        isClient ? argsToVehicle.arrayWheelsMesh.push(clonedMesh) : '';
        isClient ? Engine.scene.add(clonedMesh) : '';
        // @ts-ignore
        mesh.userData.restLength != undefined ? argsToVehicle.suspensionRestLength = parseFloat(mesh.userData.restLength) : '';
        break;

      case 'steering_wheel':
        // to do
        break;
    }
    // parse colliders of car
    switch (mesh.userData.type) {
      case 'sphere':
        argsToVehicle.vehicleSphereColliders.push(mesh);
        deleteArr.push(mesh);
        break;
    }
  });

  // dalete colliders and else mesh from threejs scene
  for (let i = 0; i < deleteArr.length; i++) {
    deleteArr[i].parent.remove(deleteArr[i]);
  }
  addComponent(entity, VehicleBody, argsToVehicle);
};

function plusParametersFromEditorToMesh(entity, mesh) {
  const transform = getComponent(entity, TransformComponent);
  mesh.position.set(
    transform.position.x + mesh.position.x,
    transform.position.y + mesh.position.y,
    transform.position.z + mesh.position.z
  );
  mesh.scale.set(
    transform.scale.x * mesh.scale.x,
    transform.scale.y * mesh.scale.y,
    transform.scale.z * mesh.scale.z
  );
}


function addColliderComponent(entity, mesh) {
  addComponent(entity, ColliderComponent, {
    type: mesh.userData.type,
    scale: mesh.scale,
    position: mesh.position,
    quaternion: mesh.quaternion,
    mesh: mesh.userData.type == "trimesh" ? mesh : null,
    mass: mesh.userData.mass ? mesh.userData.mass : 1
  });
}

// createStaticColliders

function createStaticCollider(mesh) {
  if (mesh.type == 'Group') {
    for (let i = 0; i < mesh.children.length; i++) {
      addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.children[i].quaternion, mesh.children[i].scale, mesh.children[i]);
    }
  } else if (mesh.type == 'Mesh') {
    addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.quaternion, mesh.scale, mesh);
  }
}

// createDynamicColliders

function createDynamicColliderClient(entity, mesh) {
  if (!PhysicsSystem.serverOnlyRigidBodyCollides)
    addColliderComponent(entity, mesh);

  const networkId = Network.getNetworkId();
  addComponent(entity, NetworkObject, { ownerId: 'server', networkId: networkId });
  addComponent(entity, RigidBody);
}

function createDynamicColliderServer(entity, mesh) {

  const networkObject = initializeNetworkObject('server', Network.getNetworkId(), PrefabType.worldObject);
  const uniqueId = getComponent(entity, AssetLoader).entityIdFromScenaLoader.entityId;

  addColliderComponent(networkObject.entity, mesh);
  addComponent(networkObject.entity, RigidBody);
  // Add the network object to our list of network objects
  console.warn(networkObject.entity);
  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: 'server',
    prefabType: PrefabType.worldObject, // All network objects need to be a registered prefab
    component: networkObject,
    uniqueId: uniqueId
  };

  Network.instance.createObjects.push({
    networkId: networkObject.networkId,
    ownerId: 'server',
    prefabType: PrefabType.worldObject,
    uniqueId: uniqueId,
    x: 0,
    y: 0,
    z: 0,
    qX: 0,
    qY: 0,
    qZ: 0,
    qW: 0
  });
}

// Car functions

function createVehicleOnClient(entity, mesh) {
  addComponent(entity, NetworkObject, { ownerId: 'server', networkId: Network.getNetworkId() });
  addComponent(entity, Input, { schema: VehicleInputSchema }),
    addComponent(entity, Interactable, {
      interactionParts: ['door_front_left', 'door_front_right'],
      onInteraction: getInCar,
      onInteractionCheck: getInCarPossible,
      onInteractionFocused: onInteractionHover,
      data: {
        interactionText: 'get in car'
      },
    });
  parseCarModel(entity, mesh);
}

function createVehicleOnServer(entity, mesh) {
  const networkObject = initializeNetworkObject('server', Network.getNetworkId(), PrefabType.worldObject);
  const uniqueId = getComponent(entity, AssetLoader).entityIdFromScenaLoader.entityId;
  removeEntity(entity)
  // add components
  addComponent(networkObject.entity, Input, { schema: VehicleInputSchema }),
    addComponent(networkObject.entity, Interactable, {
      interactionParts: ['door_front_left', 'door_front_right'],
      onInteraction: getInCar,
      onInteractionCheck: getInCarPossible
    });
  // creating components like in client
  parseCarModel(networkObject.entity, mesh)
  // Add the network object to our list of network objects
  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: 'server',
    prefabType: PrefabType.worldObject, // All network objects need to be a registered prefab
    component: networkObject,
    uniqueId: uniqueId
  };
  Network.instance.createObjects.push({
    networkId: networkObject.networkId,
    ownerId: 'server',
    prefabType: PrefabType.worldObject,
    uniqueId: uniqueId,
    x: 0,
    y: 0,
    z: 0,
    qX: 0,
    qY: 0,
    qZ: 0,
    qW: 0
  });
}

// parse Function

export const addWorldColliders: Behavior = (entity: Entity, args: any) => {

  const asset = args.asset;
  const deleteArr = [];

  function parseColliders(mesh) {
    // have user data physics its our case
    if (mesh.userData.data === 'physics' || mesh.userData.data === 'dynamic' || mesh.userData.data === 'vehicle') {
      // add position from editor to mesh
      plusParametersFromEditorToMesh(entity, mesh);
      // its for delete mesh from view scene
      mesh.userData.data === 'vehicle' ? '' : deleteArr.push(mesh);
      // parse types of colliders
      switch (mesh.userData.data) {
        case 'physics':
          createStaticCollider(mesh);
          break;
        case 'dynamic':
          isServer ? createDynamicColliderServer(entity, mesh) : createDynamicColliderClient(entity, mesh);
          break;
        case 'vehicle':
          isServer ? createVehicleOnServer(entity, mesh) : createVehicleOnClient(entity, mesh);
          break;
        default:
          createStaticCollider(mesh);
          break;
      }
    }
  }

  // its for diferent files with models
  if (asset.scene) {
    asset.scene.traverse(parseColliders);
  } else {
    asset.traverse(parseColliders);
  }

  // its for delete mesh from view scene
  for (let i = 0; i < deleteArr.length; i++) {
    deleteArr[i].parent.remove(deleteArr[i]);
  }

  return entity;
};


/**
 * Add Component into Entity from the Behavior.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component and args of Component which will be added into the Entity.
 */
export function addComponentFromBehavior<C>(
  entity: Entity,
  args: {
    component: ComponentConstructor<Component<C>>
    objArgs: any
  }
): void {
  addComponent(entity, args.component, args.objArgs);
}

/**
 * Add Tag Component with into Entity from the Behavior.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component which will be added into the Entity.
 */
export function addTagComponentFromBehavior<C>(
  entity: Entity,
  args: { component: ComponentConstructor<Component<C>> }
): void {
  // console.log("Adding ", args.component, " to ", entity);
  addComponent(entity, args.component);
}


export const SceneObjectLoadingSchema: LoadingSchema = {
  'ambient-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: AmbientLight },
        values: [
          { from: 'color', to: 'color' },
          { from: 'intensity', to: 'intensity' }
        ]
      }
    ],
    components: [{
      type: LightTagComponent
    }]
  },
  // currently this breaks CSM

  //   'directional-light': {
  //     behaviors: [
  //       {
  //         behavior: addObject3DComponent,
  //         args: { obj3d: DirectionalLight, objArgs: { castShadow: true } },
  //         values: [
  //           { from: 'shadowMapResolution', to: 'shadow.mapSize' },
  //           { from: 'shadowBias', to: 'shadow.bias' },
  //           { from: 'shadowRadius', to: 'shadow.radius' },
  //           { from: 'intensity', to: 'intensity' },
  //           { from: 'color', to: 'color' }
  //         ]
  //       }
  //     ],
  //       components: [{
  //         type: LightTagComponent
  //       }]
  //   },
  'collidable': {
    components: [
      {
        type: CollidableTagComponent
      }
    ]
  },
  "floor-plan": {}, // Doesn't do anything in client mode
  'gltf-model': {
    behaviors: [
      {
        behavior: addComponentFromBehavior,
        args: {
          component: AssetLoader,
        },
        values: [
          { from: 'src', to: 'url' }
        ]
      },
      {
        behavior: (entity) => {
          console.log("*********** ADDING WORLD COLLIDERS TO ONLOADED")
          getMutableComponent<AssetLoader>(entity, AssetLoader).onLoaded.push(addWorldColliders);
        }
      }
    ]
  },
  'interact': {
    behaviors: [
      {
        behavior: createCommonInteractive,
        values: [
          { from: 'interactable', to: 'interactable' },
          { from: 'interactionType', to: 'interactionType' },
          { from: 'interactionText', to: 'interactionText' },
          { from: 'payloadName', to: 'payloadName' },
          { from: 'payloadUrl', to: 'payloadUrl' },
          { from: 'payloadBuyUrl', to: 'payloadBuyUrl' },
          { from: 'payloadLearnMoreUrl', to: 'payloadLearnMoreUrl' },
          { from: 'payloadHtmlContent', to: 'payloadHtmlContent' },
          { from: 'payloadModelUrl', to: 'payloadModelUrl' },
        ],
      }
    ]
  },
  'ground-plane': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: {
          // obj3d: new GridHelper( 1000, 5000 )
          obj3d: new Mesh(
            new CircleBufferGeometry(1000, 32).rotateX(-Math.PI / 2),
            new MeshPhongMaterial({
              color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464)
            })
          ),
          objArgs: { receiveShadow: true }
        },
        values: [{ from: 'color', to: 'material.color' }]
      }
    ]
  },
  'hemisphere-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: HemisphereLight },
        values: [
          { from: 'skyColor', to: 'skyColor' },
          { from: 'groundColor', to: 'groundColor' },
          { from: 'intensity', to: 'intensity' }
        ]
      }
    ]
  },
  'point-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: PointLight },
        values: [
          { from: 'color', to: 'color' },
          { from: 'intensity', to: 'intensity' },
          { from: 'distance', to: 'distance' },
          { from: 'decay', to: 'decay' }
        ]
      }
    ]
  },
  'skybox': {
    behaviors: [
      {
        behavior: createSkybox,
        // args: { obj3d: Sky },
        values: [
          { from: 'texture', to: 'texture' },
          { from: 'skytype', to: 'skytype' },
          { from: 'distance', to: 'distance' },
          { from: 'inclination', to: 'inclination' },
          { from: 'azimuth', to: 'azimuth' },
          { from: 'mieCoefficient', to: 'mieCoefficient' },
          { from: 'mieDirectionalG', to: 'mieDirectionalG' },
          { from: 'rayleigh', to: 'rayleigh' },
          { from: 'turbidity', to: 'turbidity' }
        ]
      }
    ]
  },
  'image': {
    behaviors: [
      {
        behavior: createImage,
        values: [
          { from: 'src', to: 'src' },
          { from: 'projection', to: 'projection' },
          { from: 'controls', to: 'controls' },
          { from: 'alphaMode', to: 'alphaMode' },
          { from: 'alphaCutoff', to: 'alphaCutoff' }
        ]
      }
    ]
  },
  'video': {
    behaviors: [
      {
        behavior: isClient ? createMedia : createMediaServer,
        values: [
          { from: 'src', to: 'src' },
          { from: 'projection', to: 'projection' },
          { from: 'controls', to: 'controls' },
          { from: 'autoPlay', to: 'autoPlay' },
          { from: 'loop', to: 'loop' },
          { from: 'audioType', to: 'audioType' },
          { from: 'volume', to: 'volume' },
          { from: 'distanceModel', to: 'distanceModel' },
          { from: 'rolloffFactor', to: 'rolloffFactor' },
          { from: 'refDistance', to: 'refDistance' },
          { from: 'maxDistance', to: 'maxDistance' },
          { from: 'coneInnerAngle', to: 'coneInnerAngle' },
          { from: 'coneOuterAngle', to: 'coneOuterAngle' },
          { from: 'coneOuterGain', to: 'coneOuterGain' }
        ]
      }
    ]
  },
  'audio': {
    behaviors: [
      {
        behavior: isClient ? createMedia : createMediaServer,
        values: [
          { from: 'src', to: 'src' },
          { from: 'projection', to: 'projection' },
          { from: 'controls', to: 'controls' },
          { from: 'autoPlay', to: 'autoPlay' },
          { from: 'loop', to: 'loop' },
          { from: 'audioType', to: 'audioType' },
          { from: 'volume', to: 'volume' },
          { from: 'distanceModel', to: 'distanceModel' },
          { from: 'rolloffFactor', to: 'rolloffFactor' },
          { from: 'refDistance', to: 'refDistance' },
          { from: 'maxDistance', to: 'maxDistance' },
          { from: 'coneInnerAngle', to: 'coneInnerAngle' },
          { from: 'coneOuterAngle', to: 'coneOuterAngle' },
          { from: 'coneOuterGain', to: 'coneOuterGain' }
        ]
      }
    ]
  },
  'volumetric': {
    behaviors: [
      {
        behavior: createVolumetric,
        values: [
          { from: 'src', to: 'src' },
          { from: 'controls', to: 'controls' },
          { from: 'autoPlay', to: 'alphaMode' },
          { from: 'loop', to: 'loop' },
          { from: 'audioType', to: 'audioType' },
          { from: 'volume', to: 'volume' },
          { from: 'distanceModel', to: 'distanceModel' },
          { from: 'rolloffFactor', to: 'rolloffFactor' },
          { from: 'refDistance', to: 'refDistance' },
          { from: 'maxDistance', to: 'maxDistance' },
          { from: 'coneInnerAngle', to: 'coneInnerAngle' },
          { from: 'coneOuterAngle', to: 'coneOuterAngle' },
          { from: 'coneOuterGain', to: 'coneOuterGain' }
        ]
      }
    ]
  },
  'spot-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: SpotLight },
        values: ['color', 'intensity', 'distance', 'angle', 'penumbra', 'decay']
      }
    ]
  },
  'transform': {
    behaviors: [
      {
        behavior: createTransformComponent,
        values: ['position', 'rotation', 'scale']
      }
    ]
  },
  'visible': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: VisibleTagComponent }
      }
    ]
  },
  'walkable': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: WalkableTagComponent }
      }
    ]
  },
  'fog': {
    behaviors: [
      {
        behavior: setFog,
        values: ['color', 'density', 'far', 'near', 'type']
      }
    ]
  },
  'background': {
    behaviors: [
      {
        behavior: createBackground,
        values: ['color']
      }
    ]
  },
  'audio-settings': {
    behaviors: [
      {
        behavior: handleAudioSettings,
        values: ['avatarDistanceModel', 'avatarMaxDistance', 'avatarRefDistance', 'avatarRolloffFactor', 'mediaConeInnerAngle', 'mediaConeOuterAngle', 'mediaConeOuterGain', 'mediaDistanceModel', 'mediaMaxDistance', 'mediaRefDistance', 'mediaRolloffFactor', 'mediaVolume', 'overrideAudioSettings']
      }
    ]
  },
  'spawn-point': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: SpawnPointComponent }
      }
    ]
  },
  'scene-preview-camera': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: ScenePreviewCameraTagComponent }
      },
      {
        behavior: createScenePreviewCamera
      }
    ]
  },
  'shadow': {
    behaviors: [
      {
        behavior: createShadow,
        values: [
          { from: 'cast', to: 'castShadow' },
          { from: 'receive', to: 'receiveShadow' },
        ]
      }
    ]
  },
  'group': {
    behaviors: [
      {
        behavior: createGroup
      }
    ]
  },
  'box-collider': {
    behaviors: [
      {
        behavior: createBoxCollider,
        values: ['type', 'position', 'quaternion', 'scale']
      }
    ]
  },
  'trigger-volume': {
    behaviors: [
      {
        behavior: createTriggerVolume
      }
    ]
  },
  // 'link': {
  //   behaviors: [
  //     {
  //       behavior: createLink
  //     }
  //   ]
  // },
  'particle-emitter': {
    behaviors: [
      {
        behavior: createParticleEmitter,
        values: ['ageRandomness', 'angularVelocity', 'colorCurve', 'endColor', 'endOpacity', 'endSize', 'endVelocity', 'lifetime', 'lifetimeRandomness', 'middleColor', 'middleOpacity', 'particleCount', 'sizeCurve', 'sizeRandomness', 'src', 'startColor', 'startOpacity', 'startSize', 'startVelocity', 'velocityCurve']
      }
    ],
  }
};
