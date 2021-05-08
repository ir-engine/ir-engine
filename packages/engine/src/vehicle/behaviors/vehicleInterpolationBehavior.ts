
/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Behavior } from "../../common/interfaces/Behavior";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { Object3DComponent } from "../../scene/components/Object3DComponent";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { VehicleComponent } from "../components/VehicleComponent";

export const vehicleInterpolationBehavior: Behavior = (entity: Entity, args): void => {
  if (args.snapshot == null) return;
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  const vehicleComponent = getComponent(entity, VehicleComponent) as VehicleComponent;
  const vehicle = vehicleComponent.vehiclePhysics;
  const chassisBody = vehicle.chassisBody;
  const isDriver = vehicleComponent.driver == Network.instance.localAvatarNetworkId;
  const wheels = vehicleComponent.arrayWheelsMesh;
  const model = getComponent(entity, Object3DComponent)
  // LAZY LOAD CAR MODEL
  if (!vehicleComponent.vehicleMesh && model !== undefined && model.value !== undefined && model.value.children[0] !== undefined) {
    console.warn('test');
    //  const interactable = getMutableComponent(entity, Interactable);
    //  interactable.interactionPartsPosition = [];
    try {
      model.value.traverse(mesh => {
        let n = null;
        switch (mesh.name) {
          case 'door_front_left':
          case 'door_front_right':
            //interactable.interactionPartsPosition.push([mesh.position.x, mesh.position.y, mesh.position.z]);
            vehicleComponent.vehicleDoorsArray.push(mesh)
            break;

          case 'wheel_front_left':
            n = 0
            vehicleComponent.arrayWheelsMesh[n] = mesh.clone();
            vehicle.wheelInfos[n].chassisConnectionPointLocal.set(mesh.position.x, mesh.position.y, mesh.position.z);
            Engine.scene.add(vehicleComponent.arrayWheelsMesh[n]);
            mesh.parent.remove(mesh);
            break;
          case 'wheel_front_right':
            n = 1
            vehicleComponent.arrayWheelsMesh[n] = mesh.clone();
            vehicle.wheelInfos[n].chassisConnectionPointLocal.set(mesh.position.x, mesh.position.y, mesh.position.z);
            Engine.scene.add(vehicleComponent.arrayWheelsMesh[n]);
            mesh.parent.remove(mesh);
            break;
          case 'wheel_rear_left':
            n = 2
            vehicleComponent.arrayWheelsMesh[n] = mesh.clone();
            vehicle.wheelInfos[n].chassisConnectionPointLocal.set(mesh.position.x, mesh.position.y, mesh.position.z);
            Engine.scene.add(vehicleComponent.arrayWheelsMesh[n]);
            mesh.parent.remove(mesh);
            break;
          case 'wheel_rear_right':
            n = 3
            vehicleComponent.arrayWheelsMesh[n] = mesh.clone();
            vehicle.wheelInfos[n].chassisConnectionPointLocal.set(mesh.position.x, mesh.position.y, mesh.position.z);
            Engine.scene.add(vehicleComponent.arrayWheelsMesh[n]);
            mesh.parent.remove(mesh);
            break;
        }
      });
      getMutableComponent(entity, VehicleComponent).vehicleMesh = true;
    } catch (err) {
      console.log(err);
    }
  }

  if (!isDriver && args.snapshot.qX != undefined) {

    chassisBody.position.set(
      args.snapshot.x,
      args.snapshot.y,
      args.snapshot.z
    );

    chassisBody.quaternion.set(
      args.snapshot.qX,
      args.snapshot.qY,
      args.snapshot.qZ,
      args.snapshot.qW
    );

    for (let i = 0; i < wheels.length; i++) {
      vehicle.updateWheelTransform(i);
      wheels[i].position.set(
        vehicle.wheelInfos[i].worldTransform.position.x,
        vehicle.wheelInfos[i].worldTransform.position.y,
        vehicle.wheelInfos[i].worldTransform.position.z
      );
      wheels[i].quaternion.set(
        vehicle.wheelInfos[i].worldTransform.quaternion.x,
        vehicle.wheelInfos[i].worldTransform.quaternion.y,
        vehicle.wheelInfos[i].worldTransform.quaternion.z,
        vehicle.wheelInfos[i].worldTransform.quaternion.w
      );
    }
  }
};
