import { Vector3, Quaternion, Matrix4, Euler } from "three";
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
import { CameraModes } from "../types/CameraModes";

const euler = new Euler(0, 0, 0, "YXZ");
let direction = new Vector3();
const up = new Vector3(0, 1, 0);
const empty = new Vector3();
const PI_2 = Math.PI / 2;
const mx = new Matrix4();

/**
 * Set camera to follow the entity.
 * @param entityIn Camera Entity.
 * @param entityOut Character Entity which will be followed.
 */
export const setCameraFollow: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  const cameraDesiredTransform: DesiredTransformComponent = getMutableComponent(entityIn, DesiredTransformComponent) as DesiredTransformComponent; // Camera
  const cameraTransform = getMutableComponent(entityIn, TransformComponent); // Camera
  if (!cameraDesiredTransform.position) {
    cameraDesiredTransform.position = new Vector3();
  }
  if (!cameraDesiredTransform.rotation) {
    cameraDesiredTransform.rotation = new Quaternion();
  }
  const targetTransform: TransformComponent = getMutableComponent(entityOut, TransformComponent); // Player 

  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entityOut, CharacterComponent as any);

  const inputComponent = getComponent(entityOut, Input) as Input;
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entityOut, FollowCameraComponent) as FollowCameraComponent;

  const isLockedToAvatar = cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam

  let inputAxes;
  if (isLockedToAvatar) {
    inputAxes = DefaultInput.MOUSE_MOVEMENT;
  } else {
    inputAxes = DefaultInput.LOOKTURN_PLAYERONE;
  }

  const inputValue = getInputData(inputComponent, inputAxes, args?.forceRefresh) || [0, 0]

  if (!args?.forceRefresh || cameraFollow.mode === CameraModes.FirstPerson) {
    cameraDesiredTransform.positionRate = 5;
  }

  if (cameraFollow.mode === CameraModes.FirstPerson) {

    euler.setFromQuaternion(cameraDesiredTransform.rotation);
    
    euler.y -= inputValue[0];
    euler.x += inputValue[1];
    
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    
    cameraTransform.rotation.setFromEuler(euler);
    cameraDesiredTransform.rotation.setFromEuler(euler);
    actor.tiltContainer.rotation.y = euler.y - Math.PI
    
    cameraTransform.position.copy(actor.tiltContainer.position)
    cameraDesiredTransform.position.copy(targetTransform.position);

  } else {

    const targetTheta = Math.atan2(actor.orientation.x, actor.orientation.z) * 180 / Math.PI + 180;// target theta

    cameraFollow.theta = targetTheta;
    cameraFollow.theta %= 360;
  
    cameraFollow.phi -= inputValue[1] * 50;
    cameraFollow.phi = Math.min(85, Math.max(0, cameraFollow.phi));

    let camDist = cameraFollow.distance;
    if (cameraFollow.mode === CameraModes.ShoulderCam) camDist = cameraFollow.minDistance;
    else if (cameraFollow.mode === CameraModes.TopDown) camDist = cameraFollow.maxDistance;
    
    const phi = cameraFollow.mode === CameraModes.TopDown ? 85 : cameraFollow.phi;
    
    cameraDesiredTransform.position.set(
      targetTransform.position.x + camDist * Math.sin(cameraFollow.theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180),
      targetTransform.position.y + camDist * Math.sin(phi * Math.PI / 180),
      targetTransform.position.z + camDist * Math.cos(cameraFollow.theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180)
    );
    
    direction.copy(cameraDesiredTransform.position)
    direction = direction.sub(targetTransform?.position).normalize();

    mx.lookAt(direction, empty, up);
    cameraDesiredTransform.rotation.setFromRotationMatrix(mx);
  }
};


