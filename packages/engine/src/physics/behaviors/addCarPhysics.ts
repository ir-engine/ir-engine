import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { Matrix4, Vector3 } from "three";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';

function castShadowOn( group ) {
  group.children.forEach( children => {
    if (children.type == 'Mesh') {
      children.castShadow = true;
    }
  })
}

export const addCarPhysics: Behavior = (entity: Entity, groupMeshes: any ) => {
  const offsetPositionY = 0;
  const deleteArr = [];
  const argsToVehicle = {
    vehicleDoorsArray: [],
    seatsArray: [],
    entrancesArray: [],
    arrayWheelsPosition: [],
    arrayWheelsMesh: [],
    vehicleSphereColliders: [],
    suspensionRestLength: 0,
    vehicleMesh: null,
    mass: 0,
    vehicleCollider: null,
    startPosition: [
      groupMeshes.position.x,
      groupMeshes.position.y,
      groupMeshes.position.z
    ]
  };
  // copy position from editor position model
  groupMeshes.position.set(0,0,0);
  // Parse Meshes to functionality parts
  groupMeshes.traverse( mesh => {
     // add optimized shadow
     mesh.userData.data === 'castShadow' ? castShadowOn( mesh ):'';
     // parse meshes to functionality parts of car
     switch (mesh.name) {
       case 'body':
         argsToVehicle.vehicleMesh = mesh;
         mesh.userData.mass != undefined ? argsToVehicle.mass = parseFloat(mesh.userData.mass) : '';
         break;

       case 'door_front_left':
       case 'door_front_right':
         argsToVehicle.vehicleDoorsArray.push(mesh);
         break;

       case 'collider':
         argsToVehicle.vehicleCollider = mesh;
         deleteArr.push(mesh);
         break;

       case 'seat_front_left':
       case 'seat_front_right':
         argsToVehicle.seatsArray.push([mesh.position.x, mesh.position.y - offsetPositionY, mesh.position.z]);
         break;

       case 'entrance_front_left':
       case 'entrance_front_right':
         argsToVehicle.entrancesArray.push([mesh.position.x, mesh.position.y - offsetPositionY, mesh.position.z]);
         break;

       case 'wheel_front_left':
       case 'wheel_front_right':
       case 'wheel_rear_left':
       case 'wheel_rear_right':
        let clonedMesh = mesh.clone();
         deleteArr.push(mesh);
         argsToVehicle.arrayWheelsPosition.push(new Vector3().copy(mesh.position));
         argsToVehicle.arrayWheelsMesh.push(clonedMesh);
         Engine.scene.add(clonedMesh);
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
