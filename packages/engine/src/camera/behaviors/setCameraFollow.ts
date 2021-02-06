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
const vec3 = new Vector3();

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
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entityOut, CharacterComponent as any);

  const inputComponent = getComponent(entityOut, Input) as Input;
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entityOut, FollowCameraComponent) as FollowCameraComponent;

  // this is for future integration of MMO style pointer lock controls
  // let inputAxes;
  // if (cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
  //   inputAxes = DefaultInput.MOUSE_MOVEMENT;
  // } else {
    const inputAxes = DefaultInput.LOOKTURN_PLAYERONE;
  // }

  const inputValue = getInputData(inputComponent, inputAxes, args?.forceRefresh) || [0, 0]

  if (!args?.forceRefresh || cameraFollow.mode === CameraModes.FirstPerson) {
    cameraDesiredTransform.positionRate = 5;
  }
  const targetTheta = Math.atan2(actor.orientation.x, actor.orientation.z) * 180 / Math.PI + 180;// target theta

  cameraFollow.theta = targetTheta;
  cameraFollow.theta %= 360;

  cameraFollow.phi -= inputValue[1] * 50;
  cameraFollow.phi = Math.min(85, Math.max(-85, cameraFollow.phi));

  let camDist = cameraFollow.distance;
  if (cameraFollow.mode === CameraModes.FirstPerson) camDist = 0.01;
  else if (cameraFollow.mode === CameraModes.ShoulderCam) camDist = cameraFollow.minDistance;
  else if (cameraFollow.mode === CameraModes.TopDown) camDist = cameraFollow.maxDistance;

  // TODO: add a raycast to limit camDist
  
  const phi = cameraFollow.mode === CameraModes.TopDown ? 85 : cameraFollow.phi;

  const shoulderOffsetWorld = cameraFollow.offset.clone().applyQuaternion(actor.tiltContainer.quaternion);
  const targetPosition = actor.tiltContainer.getWorldPosition(vec3).add(shoulderOffsetWorld);
  
  cameraDesiredTransform.position.set(
      targetPosition.x + camDist * Math.sin(cameraFollow.theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180),
      targetPosition.y + camDist * Math.sin(phi * Math.PI / 180),
      targetPosition.z + camDist * Math.cos(cameraFollow.theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180)
  );

  direction.copy(cameraDesiredTransform.position);
  direction = direction.sub(targetPosition).normalize();
  
  mx.lookAt(direction, empty, up);
  cameraDesiredTransform.rotation.setFromRotationMatrix(mx);

  if(cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
      cameraTransform.rotation.copy(cameraDesiredTransform.rotation);
  }

  if (cameraFollow.mode === CameraModes.FirstPerson) {
      cameraTransform.position.copy(targetPosition);
      cameraDesiredTransform.position.copy(cameraTransform.position);
  }
};


