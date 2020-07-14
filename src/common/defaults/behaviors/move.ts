import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Actor } from "../components/Actor"
import { TransformComponent } from "../components/TransformComponent"
import { NumericalType, Vector3, Vector2 } from "../../types/NumericalTypes"
import { Crouching } from "../components/Crouching"
import { Sprinting } from "../components/Sprinting"
import Input from "../../../input/components/Input"
import InputAlias from "../../../input/types/InputAlias"
import { InputType } from "../../../input/enums/InputType"

let input: Input
let actor: Actor
let transform: TransformComponent
let inputValue: NumericalType // Could be a (small) source of garbage
let inputType: InputAlias
let movementModifer: number
let outputSpeed: number
export const move: Behavior = (entityIn: Entity, args: { input: InputAlias; inputType: InputType; value: NumericalType }, delta: number): void => {
  input = entityIn.getComponent(Input)
  actor = entityIn.getComponent(Actor)
  transform = entityIn.getComponent(TransformComponent)
  movementModifer = entityIn.hasComponent(Crouching) ? 0.5 : entityIn.hasComponent(Sprinting) ? 1.5 : 1.0

  outputSpeed = actor.accelerationSpeed * delta * movementModifer

  if (inputType === InputType.TWOD) {
    inputValue = input.data.get(args.input).value as Vector2
    transform.velocity[0] += Math.min(inputValue[0] + inputValue[0] * outputSpeed, actor.maxSpeed)
    transform.velocity[2] += Math.min(inputValue[1] + inputValue[1] * outputSpeed, actor.maxSpeed)
  }
  if (inputType === InputType.THREED) {
    inputValue = input.data.get(args.input).value as Vector3
    transform.velocity[0] += Math.min(inputValue[0] + inputValue[0] * outputSpeed, actor.maxSpeed)
    transform.velocity[1] += Math.min(inputValue[1] + inputValue[1] * outputSpeed, actor.maxSpeed)
    transform.velocity[2] += Math.min(inputValue[2] + inputValue[2] * outputSpeed, actor.maxSpeed)
  } else {
    console.error("Movement is only available for 2D and 3D inputs")
  }
  console.log("Moved")
}
