import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { Matrix4, Vector3 } from "three";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';

export const addCarPhysics: Behavior = (entity: Entity, args: any ) => {

  const offsetPositionY = 0.8;

  addComponent(entity, VehicleBody);

  const vehicleComponent = getMutableComponent(entity, VehicleBody) as VehicleBody;
  const asset = args.asset;
  const deleteArr = [];
  const arrayWheels = [];

   asset.scene.traverse( mesh => {
     if (mesh.type == 'Mesh') {
       mesh.applyMatrix4( new Matrix4().makeTranslation( 0, 0, offsetPositionY) );
     }

     if (mesh.name == 'body') {
       vehicleComponent.vehicleMesh = mesh;
     }

     if ( mesh.name == 'door_front_left' ||  mesh.name == 'door_front_right') { //mesh.name == 'steering_wheel'
       vehicleComponent.vehicleDoorsArray.push(mesh);
     }


     if (mesh.name == "collider" ) {
       mesh.geometry.applyMatrix4( new Matrix4().makeRotationX(  Math.PI / 2 ) );
       vehicleComponent.vehicleCollider = mesh;
       deleteArr.push(mesh);
     }

     if (mesh.name.substring(0,6) == "Sphere") {
        deleteArr.push(mesh);
        mesh.applyMatrix4( new Matrix4().makeRotationX(  Math.PI / 2 ) );
        vehicleComponent.vehicleSphereColliders.push(mesh);
     }

     if (mesh.name == 'seat_front_left' || mesh.name == 'seat_front_right') {
       vehicleComponent.seatsArray.push([mesh.position.x, mesh.position.y - offsetPositionY, mesh.position.z]);
     }
     if (mesh.name == 'entrance_front_left' || mesh.name == 'entrance_front_right') {
       vehicleComponent.entrancesArray.push([mesh.position.x, mesh.position.y - offsetPositionY, mesh.position.z]);
     }

     if (mesh.name.substring(0,5) == "wheel") {
        deleteArr.push(mesh);
        vehicleComponent.arrayWheelsPosition.push(new Vector3().copy(mesh.position) );
        vehicleComponent.arrayWheelsMesh.push(mesh.clone());
     }
   });

   for (let i = 0; i < deleteArr.length; i++) {
     deleteArr[i].parent.remove(deleteArr[i]);
   }
   for (let i = 0; i < vehicleComponent.arrayWheelsMesh.length; i++) {
     Engine.scene.add(vehicleComponent.arrayWheelsMesh[i]);
   }

  return entity;
};
