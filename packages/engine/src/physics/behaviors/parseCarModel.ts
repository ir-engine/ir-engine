import { Vector3 } from "three";
import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { isClient } from "../../common/functions/isClient";
import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { Interactable } from "@xr3ngine/engine/src/interaction/components/Interactable";

function castShadowOn( group ) {
  group.children.forEach( children => {
    if (children.type == 'Mesh') {
      children.castShadow = true;
      //children.receiveShadow = true;
    }
  })
}

export const parseCarModel: Behavior = (entity: Entity, groupMeshes: any ) => {
  const deleteArr = [];
  const argsToVehicle = {
    vehicleMesh: null,
    vehicleCollider: null,
    startPosition: [0,0,0],
    vehicleDoorsArray: [],
    seatsArray: [],
    entrancesArray: [],
    arrayWheelsPosition: [],
    arrayWheelsMesh: [],
    vehicleSphereColliders: []
  };
  // copy position from editor position model
  argsToVehicle.startPosition = [
    groupMeshes.position.x,
    groupMeshes.position.y,
    groupMeshes.position.z
  ];
  groupMeshes.position.set(0,0,0);
  // Parse Meshes to functionality parts
  groupMeshes.traverse( mesh => {
     // add optimized shadow
     isClient && mesh.userData.data === 'castShadow' ? castShadowOn( mesh ):'';
     // parse meshes to functionality parts of car
     switch (mesh.name) {
       case 'body':
         argsToVehicle.vehicleMesh = mesh;
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
        let clonedMesh = mesh.clone();
         deleteArr.push(mesh);
         argsToVehicle.arrayWheelsPosition.push(new Vector3().copy(mesh.position));
         isClient ? argsToVehicle.arrayWheelsMesh.push(clonedMesh): '';
         isClient ? Engine.scene.add(clonedMesh): '';
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
