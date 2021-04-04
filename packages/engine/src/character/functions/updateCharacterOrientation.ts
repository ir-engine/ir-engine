import { TransformComponent } from '../../transform/components/TransformComponent';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Vector3 } from "three";
import { isMobileOrTablet } from '../../common/functions/isMobile';
import { XRSystem } from '../../xr/systems/XRSystem';
import { applyVectorMatrixXZ } from '../../common/functions/applyVectorMatrixXZ';
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent';
import { CameraModes } from '../../camera/types/CameraModes';
import { Input } from '../../input/components/Input';
import { BaseInput } from '../../input/enums/BaseInput';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { NumericalType } from '../../common/types/NumericalTypes';
import { LifecycleValue } from '../../common/enums/LifecycleValue';

let prevState;
const emptyInputValue = [0, 0] as NumericalType;

/**
 * Get Input data from the device.
 *
 * @param inputComponent Input component which is holding input data.
 * @param inputAxes Axes of the input.
 * @param forceRefresh
 *
 * @returns Input value from input component.
 */
 const getInputData = (inputComponent: Input, inputAxes: number, prevValue: NumericalType ): { 
  currentInputValue: NumericalType;
  inputValue: NumericalType
} => {
  const result = {
    currentInputValue: emptyInputValue,
    inputValue: emptyInputValue,
  }
  if (!inputComponent?.data.has(inputAxes)) return result;

  const inputData = inputComponent.data.get(inputAxes);
  result.currentInputValue = inputData.value;
  result.inputValue = inputData.lifecycleState === LifecycleValue.ENDED ||
    JSON.stringify(result.currentInputValue) === JSON.stringify(prevValue)
      ? emptyInputValue : result.currentInputValue;
  return result;
}

const downVector = new Vector3(0, -1, 0)
const leftVector = new Vector3(1, 0, 0);
const upVector = new Vector3(0, 1, 0);
const forwardVector = new Vector3(0, 0, 1);
const emptyVector = new Vector3();
const damping = 0.05; // To reduce the change in direction.
const halfPI = Math.PI / 2;

export const updateCharacterOrientation = (entity, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return console.warn("Actor no initialized");
  const actorTransform = getMutableComponent(entity, TransformComponent);
  
	const localMovementDirection = actor.localMovementDirection; //getLocalMovementDirection(entity);

  if(actor.moveVectorSmooth.position.length() < 0.1) { actor.moveVectorSmooth.velocity.multiplyScalar(0.9) }
  if(actor.moveVectorSmooth.position.length() < 0.001) { actor.moveVectorSmooth.velocity.set(0,0,0); actor.moveVectorSmooth.position.set(0,0,0); }

  if(actor.changedViewAngle) {
    const viewVectorAngle = Math.atan2(actor.viewVector.z, actor.viewVector.x);
    actor.viewVector.x = Math.cos(viewVectorAngle - (actor.changedViewAngle * damping));
    actor.viewVector.z = Math.sin(viewVectorAngle - (actor.changedViewAngle * damping));
  }

  const inputComponent = getComponent(entity, Input) as Input;
  const followCamera = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent) as FollowCameraComponent;
  if(followCamera) {
    
    // this is for future integration of MMO style pointer lock controls
    // let inputAxes;
    // if (cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
    //   inputAxes = BaseInput.MOUSE_MOVEMENT;
    // } else {
      const inputAxes = BaseInput.LOOKTURN_PLAYERONE;
    // }
    const { inputValue, currentInputValue } = getInputData(inputComponent, inputAxes, prevState);
    prevState = currentInputValue;

    if(followCamera.locked && actor) {
      followCamera.theta = Math.atan2(actor.orientation.x, actor.orientation.z) * 180 / Math.PI + 180
    } else if (followCamera.locked) { // this is for cars
      followCamera.theta = Math.atan2(actorTransform.rotation.z, actorTransform.rotation.x) * 180 / Math.PI
    }

    followCamera.theta -= inputValue[0] * (isMobileOrTablet() ? 60 : 100);
    followCamera.theta %= 360;

    followCamera.phi -= inputValue[1] * (isMobileOrTablet() ? 60 : 100);
    followCamera.phi = Math.min(85, Math.max(-70, followCamera.phi));

    if(followCamera.locked || followCamera.mode === CameraModes.FirstPerson || followCamera.mode === CameraModes.XR) {
      actorTransform.rotation.setFromAxisAngle(upVector, (followCamera.theta - 180) * (Math.PI / 180));
      actor.orientation.copy(forwardVector).applyQuaternion(actorTransform.rotation);
      actorTransform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
    }
  }
  
  if(XRSystem.instance?.cameraDolly) XRSystem.instance.cameraDolly.setRotationFromAxisAngle(downVector, Math.atan2(actor.viewVector.z, actor.viewVector.x))
  
	const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();
	const moveVector = localMovementDirection.length() ? applyVectorMatrixXZ(flatViewVector, forwardVector) : emptyVector.setScalar(0);

	if (followCamera && (followCamera.mode === CameraModes.FirstPerson || followCamera.mode === CameraModes.XR))
		actor.orientationTarget.copy(new Vector3().copy(actor.orientation).setY(0).normalize());
	else if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
		actor.orientationTarget.copy(new Vector3().copy(actor.orientation).setY(0).normalize());
	else
		actor.orientationTarget.copy(new Vector3().copy(moveVector).setY(0).normalize());
};

