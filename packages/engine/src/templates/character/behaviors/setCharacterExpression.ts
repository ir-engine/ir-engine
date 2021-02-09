import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { getComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { DefaultInput } from "../../shared/DefaultInput";
import { Mesh } from "three";

const morphNameByInput = {
  [DefaultInput.FACE_EXPRESSION_HAPPY]: "Smile",
  [DefaultInput.FACE_EXPRESSION_SAD]: "Frown",
  // [CameraInput.Disgusted]: "Frown",
  // [CameraInput.Fearful]: "Frown",
  // [CameraInput.Happy]: "Smile",
  // [CameraInput.Surprised]: "Frown",
  // [CameraInput.Sad]: "Frown",
  // [CameraInput.Pucker]: "None",
  // [CameraInput.Widen]: "Frown",
  // [CameraInput.Open]: "Happy"
};

export const setCharacterExpression: Behavior = (entity: Entity, args: any): void => {
  // console.log('setCharacterExpression', args.input, morphNameByInput[args.input]);
  const object: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
  const body = object.value?.getObjectByName("Body") as Mesh;

  if (!body?.isMesh) {
    return;
  }

  const input: Input = getComponent(entity, Input);
  const inputData = input?.data.get(args.input);
  if (!inputData) {
    return;
  }
  const morphValue = inputData.value;
  const morphName = morphNameByInput[args.input];
  const morphIndex = body.morphTargetDictionary[morphName];
  if (typeof morphIndex !== 'number') {
    return;
  }

  // console.warn(args.input + ": " + morphName + ":" + morphIndex + " = " + morphValue);
  if (morphName && morphValue !== null) {
    if (typeof morphValue === 'number') {
      body.morphTargetInfluences[morphIndex] = morphValue; // 0.0 - 1.0
    }
  }
};
