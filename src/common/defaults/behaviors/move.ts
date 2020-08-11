import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import Actor from "../components/Actor"
import Transform from "../../../transform/components/Transform"
import { NumericalType, Vector3, Vector2, Vector4 } from "../../types/NumericalTypes"
import Input from "../../../input/components/Input"
import InputAlias from "../../../input/types/InputAlias"
import { InputType } from "../../../input/enums/InputType"

import { Crouching } from "../components/Crouching"
import { Sprinting } from "../components/Sprinting"

import * as QuaternionUtils from "../../../util/QuaternionUtils"

let input: Input
let actor: Actor
let transform: Transform
let inputValue: NumericalType // Could be a (small) source of garbage
let inputType: InputAlias
let outputSpeed: number
export const move: Behavior = (entity: Entity, args: { input: InputAlias; inputType: InputType; value: NumericalType }, time: any): void => {
  input = entity.getComponent(Input)
  actor = entity.getComponent<Actor>(Actor)
  transform = entity.getMutableComponent(Transform)
  const movementModifer = entity.hasComponent(Crouching) ? 0.5 : entity.hasComponent(Sprinting) ? 1.5 : 1.0

  const inputType = args.inputType
  outputSpeed = actor.accelerationSpeed * (time.delta as any) * movementModifer
  console.log("Transform Velocity X", transform.velocity[0])

  console.log("accelerationspeed, " + actor.accelerationSpeed)
  console.log("delta, ", time.delta)
  console.log("movementModifer, " + movementModifer)

  console.log("output speed", outputSpeed)

  console.log("Movement X", Math.min(transform.velocity[0] + args.value[0] * outputSpeed, actor.maxSpeed))

  const rotation: number[]  = transform.rotation
  const yaw = QuaternionUtils.yawFromQuaternion(rotation)

  if (inputType === InputType.TWOD) {
    inputValue = args.value as Vector2 // [x, -z]
    let xChange = outputSpeed * ( inputValue[1] * Math.sin(yaw) + inputValue[0] * Math.cos(yaw) )
    let zChange = outputSpeed * ( inputValue[1] * Math.cos(yaw) - inputValue[0] * Math.sin(yaw) )

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
