import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';
import { RigidBody } from '@xr3ngine/engine/src/physics/components/RigidBody';
import { ColliderComponent } from '@xr3ngine/engine/src/physics/components/ColliderComponent';
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { getComponent, addComponent } from "../../../ecs/functions/EntityFunctions";
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { AssetLoader } from '@xr3ngine/engine/src/assets/components/AssetLoader';
import { Client } from '@xr3ngine/engine/src/networking/components/Client';
import { PhysicsManager } from '@xr3ngine/engine/src/physics/components/PhysicsManager';
import { Vector3 } from 'three';
import { PrefabType } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { isServer } from '../../../common/functions/isServer';


function plusParametersFromEditorToMesh( entity, mesh ) {
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


function addComponentColleder( entity, mesh ) {
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

function createStaticCollider( mesh ) {
  if(mesh.type == 'Group') {
    for (let i = 0; i < mesh.children.length; i++) {
      addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.children[i].quaternion, mesh.children[i].scale, mesh.children[i]);
    }
  } else if (mesh.type == 'Mesh') {
    addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.quaternion, mesh.scale, mesh);
  }
}

// createDynamicColliders

function createDynamicColliderClient(entity, mesh) {
  if (!PhysicsManager.instance.serverOnlyRigidBodyCollides)
    addComponentColleder(entity, mesh);

  const networkId = Network.getNetworkId();
  addComponent(entity, NetworkObject, { ownerId: 'server', networkId: networkId });
  addComponent(entity, Client);
  addComponent(entity, RigidBody);
//  console.warn(getComponent(entity, AssetLoader).entityIdFromScenaLoader.entityId);
//  console.warn(networkId);
}


function createDynamicColliderServer(entity, mesh) {

   const networkObject = initializeNetworkObject('server', Network.getNetworkId(), PrefabType.worldObject);
   const uniqueId = getComponent(entity, AssetLoader).entityIdFromScenaLoader.entityId;

   addComponentColleder(networkObject.entity, mesh);
   addComponent(networkObject.entity, RigidBody);
   // Add the network object to our list of network objects
   Network.instance.networkObjects[networkObject.networkId] = {
       ownerId: 'server',
       prefabType: PrefabType.worldObject, // All network objects need to be a registered prefab
       component: networkObject,
       uniqueId: uniqueId
   };
   // console.warn(networkObject.networkId);

   // console.warn(uniqueId);
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

export const addWorldColliders: Behavior = (entity: Entity, args: any ) => {

  const asset = args.asset;
  const deleteArr = [];

  function parseColliders( mesh ) {
    // have user data physics its our case
    if (mesh.userData.data === 'physics' || mesh.userData.data === 'dynamic') {
      // add position from editor to mesh
      plusParametersFromEditorToMesh(entity, mesh);
      // its for delete mesh from view scene
      deleteArr.push(mesh);
      // parse types of colliders
      switch (mesh.userData.data) {
        case 'physics':
          createStaticCollider(mesh);
          break;
        case 'dynamic':
          isServer ? createDynamicColliderServer(entity, mesh) : createDynamicColliderClient(entity, mesh);
          break;
        case 'vehicle':
          // TO DO
          break;
        default:
          createStaticCollider(mesh);
          break;
      }
    }
  }

  // its for diferent files with models
  if (asset.scene) {
   asset.scene.traverse( parseColliders );
  } else {
   asset.traverse( parseColliders );
  }

  // its for delete mesh from view scene
  for (let i = 0; i < deleteArr.length; i++) {
   deleteArr[i].parent.remove(deleteArr[i]);
  }

  return entity;
};
