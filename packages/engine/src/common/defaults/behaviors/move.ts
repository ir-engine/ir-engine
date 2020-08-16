import { Entity } from "../../../ecs/classes/Entity"
import { Input } from "../../../input/components/Input"
import { InputType } from "../../../input/enums/InputType"
import { InputAlias } from "../../../input/types/InputAlias"
import { TransformComponent } from "../../../transform/components/TransformComponent"
import { Behavior } from "../../interfaces/Behavior"
import { NumericalType, Vector2, Vector3 } from "../../types/NumericalTypes"
import { Actor } from "../components/Actor"
import { Crouching } from "../components/Crouching"
import { Sprinting } from "../components/Sprinting"
import { getComponentOnEntity, getMutableComponent, entityHasComponent } from "../../../ecs/functions/EntityFunctions"

let input: Input
let actor: Actor
let transform: TransformComponent
let inputValue: NumericalType // Could be a (small) source of garbage
let outputSpeed: number
export const move: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  time: any
): void => {
  input = getComponentOnEntity(entity, Input)
  actor = getMutableComponent<Actor>(entity, Actor)
  transform = getMutableComponent(entity, TransformComponent)
  const movementModifer = entityHasComponent(entity, Crouching) ? 0.5 : entityHasComponent(entity, Sprinting) ? 1.5 : 1.0
  const inputType = args.inputType
  outputSpeed = actor.accelerationSpeed * (time.delta as any) * movementModifer
  if (inputType === InputType.TWOD) {
    inputValue = args.value as Vector2
    transform.velocity[0] = transform.velocity[0] + inputValue[0] * outputSpeed
    transform.velocity[2] = transform.velocity[2] + inputValue[1] * outputSpeed
  } else if (inputType === InputType.THREED) {
    inputValue = args.value as Vector3
    transform.velocity[0] = transform.velocity[0] + inputValue[0] * outputSpeed
    transform.velocity[1] = transform.velocity[1] + inputValue[1] * outputSpeed
    transform.velocity[2] = transform.velocity[2] + inputValue[2] * outputSpeed
  } else {
    console.error("Movement is only available for 2D and 3D inputs")
  }
}
