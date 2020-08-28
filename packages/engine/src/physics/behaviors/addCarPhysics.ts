import { BoxBufferGeometry, CylinderGeometry, Mesh, Matrix4 } from "three";
import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { createEntity, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { addObject3DComponent } from "@xr3ngine/engine/src/common/defaults/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { VehicleComponent } from '../components/VehicleComponent';
import { VehicleBody } from "@xr3ngine/engine/src/physics/components/VehicleBody";
import { WheelBody } from "@xr3ngine/engine/src/physics/components/WheelBody";

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
