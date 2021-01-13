import { Vector3, Matrix4, Euler } from "three";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { CameraComponent } from "@xr3ngine/engine/src/camera/components/CameraComponent";
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { getComponent, getMutableComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { Engine } from "../../ecs/classes/Engine";
import { countActors } from "../../xr/SkeletonFunctions";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { getInputData } from "../functions/getInputData";
import { anglesDifference } from "../functions/anglesDifference";
import { DesiredTransformComponent } from "../../transform/components/DesiredTransformComponent";

let follower, target;
let inputComponent: Input;
let cameraFollow;
let camera;
let inputValue: NumericalType;
const euler = new Euler(0, 0, 0, "YXZ");
let direction = new Vector3();
const up = new Vector3(0, 1, 0);
const empty = new Vector3();
const PI_2 = Math.PI / 2;


const mx = new Matrix4();
let theta = 0;
let phi = 0;





export const setCameraFollow: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent (entityIn, DesiredTransformComponent); // Camera
  target = getMutableComponent (entityOut, TransformComponent); // Player 

  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entityOut, CharacterComponent as any);
  const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entityOut, TransformComponent as any);
  const defaultActorVector = new Vector3(0, 0, 1.08);
    
  inputComponent = getComponent(entityOut, Input) as Input;
  cameraFollow = getComponent<FollowCameraComponent>(entityOut, FollowCameraComponent);

  camera = getMutableComponent<CameraComponent>(entityIn, CameraComponent);

  

  let inputAxes;
  if (document.pointerLockElement) {
    inputAxes = DefaultInput.MOUSE_MOVEMENT;
  } else {
    inputAxes = DefaultInput.LOOKTURN_PLAYERONE;
  }
  inputValue = getInputData(inputComponent, inputAxes);

  //This block was made for check distance as a separeted action, without any connections with mouse or touch move.
  if (!inputValue) {
    const distanceNeedsUpdate = cameraFollow.distance != follower.position.distanceTo(target.position);
    if (distanceNeedsUpdate){
      //follower.position.sub(target.position).normalize().multiplyScalar(cameraFollow.distance).add(target.position);
      follower.position.set(
        target.position.x + cameraFollow.distance * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180),
        target.position.y + cameraFollow.distance * Math.sin(phi * Math.PI / 180),
        target.position.z + cameraFollow.distance * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180)
      );
    }
    return;
  }
  if (cameraFollow.mode === "firstPerson") {

    euler.setFromQuaternion(follower.rotation);

    euler.y -= inputValue[0] * 0.01;
    euler.x -= inputValue[1] * 0.01;

    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

    follower.rotation.setFromEuler(euler);

    follower.position.set(
      target.position.x,
      target.position.y + 1,
      target.position.z
    );
  } else if (cameraFollow.mode === "thirdPerson" ) {
    theta -= inputValue[0] * 50;
    theta %= 360;
    phi -= inputValue[1] * 50;
    phi = Math.min(85, Math.max(0, phi));

    follower.position.set(
      target.position.x + cameraFollow.distance * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180),
      target.position.y + cameraFollow.distance * Math.sin(phi * Math.PI / 180),
      target.position.z + cameraFollow.distance * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180)
    );

    direction.copy(follower.position);
    direction = direction.sub(target.position).normalize();
    
    mx.lookAt(direction, empty, up);
    follower.rotation.setFromRotationMatrix(mx);
  
  } else if (cameraFollow.mode === "thirdPersonLocked") {

    // theta -= inputValue[0];

    const targetTheta = Math.atan2( actor.orientation.x,  actor.orientation.z)  * 180 / Math.PI + 180;// target theta
    // theta = Math.atan2(actor?.orientation.x, actor?.orientation.z) / Math.PI * 180 + 180;// target theta
    // Camera system
    // console.log('THETA targetTheta',targetTheta );
    // console.log('THETA FolowCAMERA',theta );

    const deltaTheta = anglesDifference(theta,targetTheta );

    // theta -= deltaTheta * 0.015;
    theta = targetTheta;
    // console.log('THETE ANGLE',theta);
    theta %= 360;
    
    // console.log('THETE ANGLE360000',theta);
    // Camera system
    // theta = theta * (Math.PI / 180);
    phi -= inputValue[1] * 50;
    phi = Math.min(85, Math.max(0, phi));

    // Camera system
    follower.position.set(
      target.position.x + cameraFollow?.distance * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180),
      target.position.y + cameraFollow?.distance * Math.sin(phi * Math.PI / 180),
      target.position.z + cameraFollow?.distance * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180)
    );

    direction.copy(follower?.position);
    direction = direction.sub(target?.position).normalize();

    mx.lookAt(direction, empty, up);
    follower.rotation.setFromRotationMatrix(mx);
        // Camera system

    }
  
};


