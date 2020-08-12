import { Entity } from "../../../ecs/Entity"
import { Input } from "../../../input/components/Input"
import { InputType } from "../../../input/enums/InputType"
import { InputAlias } from "../../../input/types/InputAlias"
import { TransformComponent } from "../../../transform/components/TransformComponent"
import { Behavior } from "../../interfaces/Behavior"
import { NumericalType } from "../../types/NumericalTypes"
export const rotateStart: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  delta: number
): void => {
  const input = entity.getMutableComponent(Input) as Input
  const transform = entity.getComponent<TransformComponent>(TransformComponent)

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
