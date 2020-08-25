import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InputAlias } from "../../input/types/InputAlias";
import { InputType } from "../../input/enums/InputType";
import { NumericalType } from "../../common/types/NumericalTypes";
import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { TransformComponent } from "../../transform/components/TransformComponent";

export const rotateStart: Behavior = (
  entity: Entity,
  args: { input: InputAlias, inputType: InputType, value: NumericalType }
): void => {
  const input = getMutableComponent(entity, Input);
  const transform = getComponent<TransformComponent>(entity, TransformComponent);

  const transformRotation: [number, number, number, number] = [
    transform.rotation[0],
    transform.rotation[1],
    transform.rotation[2],
    transform.rotation[3]
  ];

  input.data.set(input.schema.mouseInputMap.axes.mouseClickDownTransformRotation, {
    type: InputType.FOURD,
    value: transformRotation
  });
};
