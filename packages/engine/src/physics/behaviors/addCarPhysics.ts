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


const sphereGeo = new CylinderGeometry( 0.3, 0.3, 0.1, 12 )
sphereGeo.applyMatrix4( new Matrix4().makeRotationZ( - Math.PI / 2 ) );
//const sphereMesh = new THREE.Mesh( sphereGeo, new THREE.MeshStandardMaterial({ color: "pink" }))

export const addCarPhysics: Behavior = (entity: Entity, args: any ) => {

  addComponent(entity, VehicleBody);
  addComponent(entity, VehicleComponent);

  // addComponent(entity, LocalInputReceiver)
  // addComponent(entity, FollowCameraComponent, { distance: 5, mode: "thirdPerson" })

  const vehicleComponent = getMutableComponent(entity, VehicleBody) as VehicleBody;
  const scale = 1
  const asset = args.asset
  let deleteArr = []
  let arrayWheels = []
   asset.scene.traverse( mesh => { // scene gld

     if (mesh.name == 'body') {
      //mesh.scale.set(0.1,0.1,0.1)
       vehicleComponent.vehicleMesh = mesh
       //vehicleComponent.arrayVehiclePosition.push(new Vector3().copy(mesh.position) )
     }



     if (mesh.name == "collider" || mesh.name == "Window") { // mesh.userData.data
       deleteArr.push(mesh)
     }

     if (mesh.name.substring(0,5) == "wheel") {
        //mesh.scale.set(0.1,0.1,0.1)
        deleteArr.push(mesh)

        vehicleComponent.arrayWheelsPosition.push(new Vector3().copy(mesh.position) )
        vehicleComponent.arrayWheelsMesh.push(mesh.clone())
        //console.log('Engine');
        //ngine.scene.add(mesh)
      //  console.log(Engine);

     }
   })

   for (let i = 0; i < deleteArr.length; i++) {
     deleteArr[i].parent.remove(deleteArr[i])
   }
   for (let i = 0; i < vehicleComponent.arrayWheelsMesh.length; i++) {
     Engine.scene.add(vehicleComponent.arrayWheelsMesh[i])
   }


//  for (let i = 0; i < 4; i++) {
//    const wheelEntity = createEntity();
//    addComponent(wheelEntity, TransformComponent);
//    addObject3DComponent(wheelEntity, {
        // addObject3DComponent is going to call new obj(objArgs)
        // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
//        obj3d: arrayWheels[i],
//        obj3dArgs: arrayWheels[i]
//    });
//    addComponent(wheelEntity, WheelBody, { vehicle: entity });
//  }

  return entity;
};

export const removeCarPhysics: Behavior = (entity: Entity) => {
  removeComponent(entity, VehicleBody);
  return entity;
};
