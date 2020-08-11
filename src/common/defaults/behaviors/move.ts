import { Entity } from "ecsy"
import { InputType } from "../../../input/enums/InputType"
import { InputAlias } from "../../../input/types/InputAlias"
import { TransformComponent } from "../../../transform/components/TransformComponent"
import { Behavior } from "../../interfaces/Behavior"
import { NumericalType, Vector2, Vector3 } from "../../types/NumericalTypes"
import { Actor } from "../components/Actor"
import { Crouching } from "../components/Crouching"
import { Sprinting } from "../components/Sprinting"

import * as QuaternionUtils from "../../../util/QuaternionUtils"
import { Input } from "../../../input/components/Input"

let input: Input
let actor: Actor
let transform: TransformComponent
let inputValue: NumericalType // Could be a (small) source of garbage
let outputSpeed: number
export const move: Behavior = (entity: Entity, args: { input: InputAlias; inputType: InputType; value: NumericalType }, time: any): void => {
  input = entity.getComponent(Input)
  actor = entity.getComponent<Actor>(Actor)
  transform = entity.getMutableComponent(TransformComponent)
  const movementModifer = entity.hasComponent(Crouching) ? 0.5 : entity.hasComponent(Sprinting) ? 1.5 : 1.0
  const inputType = args.inputType
  outputSpeed = actor.accelerationSpeed * (time.delta as any) * movementModifer

  const rotation: number[] = transform.rotation
  const yaw = QuaternionUtils.yawFromQuaternion(rotation)

  if (inputType === InputType.TWOD) {
    inputValue = args.value as Vector2 // [x, -z]
    const xChange = outputSpeed * (inputValue[1] * Math.sin(yaw) + inputValue[0] * Math.cos(yaw))
    const zChange = outputSpeed * (inputValue[1] * Math.cos(yaw) - inputValue[0] * Math.sin(yaw))

    transform.velocity[0] = Math.min(transform.velocity[0] + xChange, actor.maxSpeed)
    transform.velocity[2] = Math.min(transform.velocity[2] + zChange, actor.maxSpeed)
  } else if (inputType === InputType.THREED) {
    inputValue = args.value as Vector3
    transform.velocity[0] = Math.min(transform.velocity[0] + inputValue[0] * outputSpeed, actor.maxSpeed)
    transform.velocity[1] = Math.min(transform.velocity[1] + inputValue[1] * outputSpeed, actor.maxSpeed)
    transform.velocity[2] = Math.min(transform.velocity[2] + inputValue[2] * outputSpeed, actor.maxSpeed)
  } else {
    console.error("Movement is only available for 2D and 3D inputs")
  }
}
