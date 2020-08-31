import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { WheelBody } from "@xr3ngine/engine/src/physics/components/WheelBody";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { CylinderGeometry, Matrix4, Mesh } from "three";
import { addObject3DComponent } from "../../common/behaviors/Object3DBehaviors";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, createEntity, removeComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleComponent } from '../components/VehicleComponent';

const sphereGeo = new CylinderGeometry( 1, 1, 0.1, 12 )
sphereGeo.applyMatrix4( new Matrix4().makeRotationZ( - Math.PI / 2 ) );
//const sphereMesh = new THREE.Mesh( sphereGeo, new THREE.MeshStandardMaterial({ color: "pink" }))

export const addCarPhysics: Behavior = (entity: Entity, args: any) => {

  addComponent(entity, VehicleBody);
  addComponent(entity, VehicleComponent);


  for (let i = 0; i < 4; i++) {
    let wheelEntity = createEntity();
    addComponent(wheelEntity, TransformComponent);
    addObject3DComponent(wheelEntity, {
        // addObject3DComponent is going to call new obj(objArgs)
        // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
        obj3d: Mesh,
        obj3dArgs: sphereGeo
    });
    addComponent(wheelEntity, WheelBody, { vehicle: entity });
  }

  return entity;
};

export const removeCarPhysics: Behavior = (entity: Entity) => {
  removeComponent(entity, VehicleBody);
  return entity;
};
