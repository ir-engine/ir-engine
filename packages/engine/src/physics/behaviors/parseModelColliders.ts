import { Vector3, Quaternion, Matrix4 } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { createNetworkRigidBody } from '../../interaction/prefabs/NetworkRigidBody';
import { createVehicleFromModel } from '../../templates/vehicle/prefabs/NetworkVehicle';
import { TransformComponent } from "../../transform/components/TransformComponent";
import { addColliderWithoutEntity } from './colliderCreateFunctions';

/**
 * @author HydraFire <github.com/HydraFire>
 */

function plusParametersFromEditorToMesh(entity, mesh) {
  const transform = getComponent(entity, TransformComponent);

  const [position, quaternion, scale] = plusParameter(
    mesh.position,
    mesh.quaternion,
    mesh.scale,
    transform.position,
    transform.rotation,
    transform.scale
  );

  mesh.position.set( position.x, position.y, position.z);
  mesh.quaternion.copy( quaternion );
  mesh.scale.set( scale.x, scale.y, scale.z );
}

export function plusParameter(posM, queM, scaM, posE, queE, scaE): [Vector3, Quaternion, any] {
  const quaternionM = new Quaternion(queM.x,queM.y,queM.z,queM.w);
  const quaternionE = new Quaternion(queE.x,queE.y,queE.z,queE.w);
  const position = new Vector3().set(posM.x, posM.y, posM.z).applyQuaternion(quaternionE)
  const quaternion = new Quaternion();
  const scale = { x: 0, y: 0, z: 0 };
  position.x = (position.x * scaE.x) + posE.x;
  position.y = (position.y * scaE.y) + posE.y;
  position.z = (position.z * scaE.z) + posE.z;
  quaternion.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(quaternionE),
      new Matrix4().makeRotationFromQuaternion(quaternionM)
    )
  );
  scale.x = scaM.x * scaE.x;
  scale.y = scaM.y * scaE.y;
  scale.z = scaM.z * scaE.z;
  return [position, quaternion, scale];
}

// createStaticColliders
export function createStaticCollider(mesh) {
  // console.log('****** Collider from Model, type: '+mesh.userData.type);

  if (mesh.type == 'Group') {
    for (let i = 0; i < mesh.children.length; i++) {
      addColliderWithoutEntity(mesh.userData, mesh.position, mesh.children[i].quaternion, mesh.children[i].scale, { mesh: mesh.children[i], vertices: null, indices: null});
    }
  } else if (mesh.type == 'Mesh') {
    addColliderWithoutEntity(mesh.userData, mesh.position, mesh.quaternion, mesh.scale, { mesh, vertices: null, indices: null });
  }
}
// only clean colliders from model Function
export const clearFromColliders: Behavior = (entity: Entity, args: any) => {
  const arr = [];
  const parseColliders = (mesh) => mesh.userData.data === 'physics' || mesh.userData.data === 'dynamic' || mesh.userData.type === 'trimesh' || mesh.userData.type === 'sphere' ? arr.push(mesh): '';
  // its for diferent files with models
  args.asset.scene ? args.asset.scene.traverse(parseColliders) : args.asset.traverse(parseColliders);
  // its for delete mesh from view scene
//
  if (args.onlyHide)
    arr.forEach(v => v.visible = false);
  else
    arr.forEach(v => v.parent.remove(v));
}

// parse Function
export const parseModelColliders: Behavior = (entity: Entity, args: any) => {
  const arr = [];
  const parseColliders = (mesh) => {
    // have user data physics its our case
    if (mesh.userData.data === 'physics' || mesh.userData.data === 'dynamic' || mesh.userData.data === 'vehicle') {
      // add position from editor to mesh
      plusParametersFromEditorToMesh(entity, mesh);
      // its for delete mesh from view scene
      mesh.userData.data === 'vehicle' ? '' : arr.push(mesh);
      // parse types of colliders
      switch (mesh.userData.data) {

        case 'physics':
          createStaticCollider( mesh );
          break;

        case 'dynamic':
          createNetworkRigidBody({
            parameters: {
              type: mesh.userData.type,
              scale: mesh.scale,
              position: mesh.position,
              quaternion: mesh.quaternion,
              mesh: mesh.userData.type === 'trimesh' ? mesh : null,
              mass: mesh.userData.mass ?? 1
            },
            uniqueId: args.uniqueId,
            entity: entity
          });
          break;

        case 'vehicle':
          createVehicleFromModel(entity, mesh, args.uniqueId);
          break;

        default:
          createStaticCollider(mesh);
          break;
      }
    }
  }
  // its for diferent files with models
  args.asset.scene ? args.asset.scene.traverse(parseColliders) : args.asset.traverse(parseColliders);
  // its for delete mesh from view scene
  arr.forEach(v => v.parent.remove(v));
};
