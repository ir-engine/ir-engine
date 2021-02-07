import { Vector3, Quaternion, Matrix4, Euler } from "three";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { getComponent, getMutableComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { getInputData } from "../functions/getInputData";
import { DesiredTransformComponent } from "../../transform/components/DesiredTransformComponent";
import { CameraModes } from "../types/CameraModes";
import { isMobileOrTablet } from "../../common/functions/isMobile";

const forwardVector = new Vector3(0, 0, 1);
let direction = new Vector3();
const upVector = new Vector3(0, 1, 0);
const empty = new Vector3();
const PI_2Deg = Math.PI / 180;
const mx = new Matrix4();
const vec3 = new Vector3();
const sensitivity = isMobileOrTablet() ? 35 : 80 // eventually this will come from some settings somewhere

/**
 * Set camera to follow the entity.
 * @param entityIn Camera Entity.
 * @param entityOut Character Entity which will be followed.
 */
export const setCameraFollow: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  const cameraDesiredTransform: DesiredTransformComponent = getMutableComponent(entityIn, DesiredTransformComponent) as DesiredTransformComponent; // Camera
  if (!cameraDesiredTransform.position) {
    cameraDesiredTransform.position = new Vector3();
  }
  if (!cameraDesiredTransform.rotation) {
    cameraDesiredTransform.rotation = new Quaternion();
  }
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entityOut, CharacterComponent as any);
  const actorTransform = getMutableComponent(entityOut, TransformComponent);

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
  
  if(cameraFollow.locked) {
    cameraFollow.theta = Math.atan2(actor.orientation.x, actor.orientation.z) * 180 / Math.PI + 180
  }
  cameraFollow.theta -= inputValue[0] * sensitivity;
  cameraFollow.theta %= 360;
  
  cameraFollow.phi -= inputValue[1] * sensitivity;
  cameraFollow.phi = Math.min(85, Math.max(-85, cameraFollow.phi));

  if(cameraFollow.locked || cameraFollow.mode === CameraModes.FirstPerson) {
    actorTransform.rotation.setFromAxisAngle(upVector, (cameraFollow.theta - 180) * (Math.PI / 180));
    actor.orientation.copy(forwardVector).applyQuaternion(actorTransform.rotation);
    actorTransform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
  }

  let camDist = cameraFollow.distance;
  if (cameraFollow.mode === CameraModes.FirstPerson) camDist = 0.01;
  else if (cameraFollow.mode === CameraModes.ShoulderCam) camDist = cameraFollow.minDistance;
  else if (cameraFollow.mode === CameraModes.TopDown) camDist = cameraFollow.maxDistance;

  // TODO: add a raycast to limit camDist
  
  const phi = cameraFollow.mode === CameraModes.TopDown ? 85 : cameraFollow.phi;

  const shoulderOffsetWorld = cameraFollow.offset.clone().applyQuaternion(actor.tiltContainer.quaternion);
  const targetPosition = actor.tiltContainer.getWorldPosition(vec3).add(shoulderOffsetWorld);
  
  cameraDesiredTransform.position.set(
      targetPosition.x + camDist * Math.sin(cameraFollow.theta * PI_2Deg) * Math.cos(phi * PI_2Deg),
      targetPosition.y + camDist * Math.sin(phi * PI_2Deg),
      targetPosition.z + camDist * Math.cos(cameraFollow.theta * PI_2Deg) * Math.cos(phi * PI_2Deg)
  );

  direction.copy(cameraDesiredTransform.position);
  direction = direction.sub(targetPosition).normalize();
  
  mx.lookAt(direction, empty, upVector);
  cameraDesiredTransform.rotation.setFromRotationMatrix(mx);

  // for pointer lock controls
  // if(cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
  //     cameraTransform.rotation.copy(cameraDesiredTransform.rotation);
  // }

  if (cameraFollow.mode === CameraModes.FirstPerson) {
    cameraDesiredTransform.position.copy(targetPosition);
  }
};


