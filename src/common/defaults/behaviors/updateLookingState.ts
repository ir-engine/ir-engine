import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Vector2, Vector4, NumericalType, Vector3 } from "../../types/NumericalTypes"
import Transform from "../../../transform/components/Transform"
import { InputType } from "../../../input/enums/InputType"
import Input from "../../../input/components/Input"
import InputAlias from "../../../input/types/InputAlias"
export const rotateStart: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  delta: number
): void => {
  const input = entity.getMutableComponent(Input) as Input
  const transform = entity.getComponent(Transform)

  const transformRotation: [number, number, number, number] = [
    transform.rotation[0],
    transform.rotation[1],
    transform.rotation[2],
    transform.rotation[3]
  ]

  input.data.set(input.schema.mouseInputMap.axes["mouseClickDownTransformRotation"], {
    type: InputType.FOURD,
    value: transformRotation
  })
}
