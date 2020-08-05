import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Vector2, Vector4, NumericalType, Vector3 } from "../../types/NumericalTypes"
import Actor from "../components/Actor"
import { TransformComponent } from "../components/TransformComponent"
import { quat, vec3 } from "gl-matrix"
import { InputType } from "../../../input/enums/InputType"
import Input from "../../../input/components/Input"
import InputAlias from "../../../input/types/InputAlias"
import State from "../../../state/components/State"
import { addState } from "../../../state/behaviors/StateBehaviors"

export const rotateStart: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  delta: number
): void => {
  let input = entity.getMutableComponent(Input) as Input
  let transform = entity.getComponent(TransformComponent)

  const transformRotation: [number, number, number, number] = [
      transform.rotation[0],
      transform.rotation[1],
      transform.rotation[2],
      transform.rotation[3]
    ]

  input.data.set(input.map.mouseInputMap.axes["mouseClickDownTransformRotation"], {
      type: InputType.FOURD,
      value: transformRotation
    })
}
