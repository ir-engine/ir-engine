import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { WheelBody } from "@xr3ngine/engine/src/physics/components/WheelBody";
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver"
import { CharacterInputSchema } from "@xr3ngine/engine/src/templates/character/CharacterInputSchema";
import { CylinderGeometry, Matrix4, Mesh, Vector3 } from "three";
import { addObject3DComponent } from "../../common/behaviors/Object3DBehaviors";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { addComponent, createEntity, removeComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleComponent } from '../components/VehicleComponent';

/*
const sphereGeo = new CylinderGeometry( 0.3, 0.3, 0.1, 12 )
sphereGeo.applyMatrix4( new Matrix4().makeRotationZ( - Math.PI / 2 ) );
const sphereMesh = new THREE.Mesh( sphereGeo, new THREE.MeshStandardMaterial({ color: "pink" }))
*/

export const addCarPhysics: Behavior = (entity: Entity, args: any ) => {

  const offsetPositionY = 0.8

  addComponent(entity, VehicleBody);

  const vehicleComponent = getMutableComponent(entity, VehicleBody) as VehicleBody;
  const asset = args.asset
  let deleteArr = []
  let arrayWheels = []

   asset.scene.traverse( mesh => {
     //console.log(mesh.type+' '+mesh.name);

     if (mesh.type == 'Mesh') {
       mesh.applyMatrix4( new Matrix4().makeTranslation( 0, 0, offsetPositionY) );
     }

     if (mesh.name == 'body') {
       vehicleComponent.vehicleMesh = mesh
     }

     if (mesh.name == 'steering_wheel' || mesh.name == 'door_front_left' ||  mesh.name == 'door_front_right') {

     }


     if (mesh.name == "collider" ) {
       // TO DO: trim mesh
       deleteArr.push(mesh)
     }

     if (mesh.name == 'seat_front_left' || mesh.name == 'seat_front_right') {
       vehicleComponent.seatsArray.push([mesh.position.x, mesh.position.y - offsetPositionY, mesh.position.z])
     }
     if (mesh.name == 'entrance_front_left' || mesh.name == 'entrance_front_right') {
       vehicleComponent.entrancesArray.push([mesh.position.x, mesh.position.y - offsetPositionY, mesh.position.z])
     }

     if (mesh.name.substring(0,5) == "wheel") {
        deleteArr.push(mesh)
        vehicleComponent.arrayWheelsPosition.push(new Vector3().copy(mesh.position) )
        vehicleComponent.arrayWheelsMesh.push(mesh.clone())
     }
   })

   for (let i = 0; i < deleteArr.length; i++) {
     deleteArr[i].parent.remove(deleteArr[i])
   }
   for (let i = 0; i < vehicleComponent.arrayWheelsMesh.length; i++) {
     Engine.scene.add(vehicleComponent.arrayWheelsMesh[i])
   }


  return entity;
};
/*
export const removeCarPhysics: Behavior = (entity: Entity) => {
  removeComponent(entity, VehicleBody);
  return entity;
};
*/
