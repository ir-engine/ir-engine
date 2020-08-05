import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Vector2, Vector4, NumericalType, Vector3 } from "../../types/NumericalTypes"
import Actor from "../components/Actor"
import TransformComponent from "../../../transform/components/TransformComponent"
import { quat, vec3 } from "gl-matrix"
import { InputType } from "../../../input/enums/InputType"
import Input from "../../../input/components/Input"
import InputAlias from "../../../input/types/InputAlias"

let actor: Actor
let transform: TransformComponent
let inputValue: Vector2 | Vector3
const q: Vector4 = [0, 0, 0, 0]
const qOut: Vector4 = [0, 0, 0, 0]
let inputComponent: Input
export const rotateAround: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  delta: number
): void => {
  inputComponent = entity.getComponent(Input)
  actor = entity.getComponent<Actor>(Actor)
  transform = entity.getComponent(TransformComponent)

  if (!inputComponent.data.has(args.input)) {
    inputComponent.data.set(args.input, { type: args.inputType, value: vec3.create() })
  }

  quat.set(qOut, transform.rotation[0], transform.rotation[1], transform.rotation[2], transform.rotation[3])
  if (args.inputType === InputType.TWOD) {
    if (inputComponent.data.has(args.input)) {
      inputValue = inputComponent.data.get(args.input).value as Vector2
      quat.fromEuler(q, inputValue[1] * actor.rotationSpeedY * delta, inputValue[0] * actor.rotationSpeedX * delta, 0)
    }
  } else if (args.inputType === InputType.THREED) {
    inputValue = inputComponent.data.get(args.input).value as Vector3
    quat.fromEuler(
      q,
      inputValue[0] * actor.rotationSpeedY * delta,
      inputValue[1] * actor.rotationSpeedX * delta,
      inputValue[2] * actor.rotationSpeedZ * delta
    )
  } else {
    console.error("Rotation is only available for 2D and 3D inputs")
  }
  quat.mul(qOut, q, qOut)

  transform.rotation = [qOut[0], qOut[1], qOut[2], qOut[3]]

  console.log("rotated ")
}
