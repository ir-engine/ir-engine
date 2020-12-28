import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { getComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CameraInput } from '../../../input/enums/CameraInput';
import { Object3DComponent } from '../../../common/components/Object3DComponent'

const morphNameByInput = {
  [CameraInput.Angry]: "Frown",
  [CameraInput.Disgusted]: "Frown",
  [CameraInput.Fearful]: "Frown",
  [CameraInput.Happy]: "Smile",
  [CameraInput.Surprised]: "Frown",
  [CameraInput.Sad]: "Frown",
  [CameraInput.Pucker]: "None",
  [CameraInput.Widen]: "Frown",
  [CameraInput.Open]: "Happy"
};

export const setCharacterExpression: Behavior = (entity: Entity, args: any): void => {
  const actor: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  // const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const body = actor.entity.getObjectByName("BODY");

  const input: Input = getComponent(entity, Input);
  const morphValue = input.data.get(args.input)?.value;
  const morphName = morphNameByInput[args.input];

  console.warn(args.input + ": " + morphName + " = " + morphValue);
  if (morphName && morphValue !== null) {
    body.morphTargetInfluences[morphName] = morphValue; // 0.0 - 1.0
  }
};
