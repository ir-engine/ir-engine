import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Vector2, Vector4, NumericalType, Vector3 } from "../../types/NumericalTypes"
import { Actor } from "../components/Actor"
import { TransformComponent } from "../components/TransformComponent"
import { quat } from "gl-matrix"
import InputAlias from "../../../input/types/InputAlias"
import { InputType } from "../../../input/enums/InputType"
import Input from "../../../input/components/Input"

let actor: Actor
let transform: TransformComponent
let inputValue: Vector2 | Vector3
let q: Vector4
let qOut: Vector4
let inputComponent: Input
let input: InputAlias
export const rotateAround: Behavior = (
  entityIn: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  delta: number
): void => {
  inputComponent = entityIn.getComponent(Input)
  actor = entityIn.getComponent(Actor)
  transform = entityIn.getComponent(TransformComponent)
  quat.set(qOut, transform.rotation[0], transform.rotation[1], transform.rotation[2], transform.rotation[3])
  if (input === InputType.TWOD) {
    inputValue = inputComponent.data.get(args.input).value as Vector2
    quat.fromEuler(q, inputValue[1] * actor.rotationSpeedY * delta, inputValue[0] * actor.rotationSpeedX * delta, 0)
  }
  if (input === InputType.THREED) {
    inputValue = inputComponent.data.get(args.input).value as Vector3
    quat.fromEuler(
      q,
      inputValue[0] * actor.rotationSpeedY * delta,
      inputValue[1] * actor.rotationSpeedX * delta,
      inputValue[1] * actor.rotationSpeedZ * delta
    )
  } else {
    console.error("Rotation is only available for 2D and 3D inputs")
  }
  quat.mul(qOut, q, qOut)

  transform.rotation = [qOut[0], qOut[1], qOut[2], qOut[3]]

  console.log("rotated")
}
