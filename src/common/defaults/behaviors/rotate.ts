import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Scalar, Vector2, Vector4 } from "../../types/NumericalTypes"
import { Actor } from "../components/Actor"
import { Transform } from "../components/Transform"
import State from "../../../state/components/State"
import { quat } from "gl-matrix"

let actor: Actor
let transform: Transform
let stateValue: Vector2
let q: Vector4
let qOut: Vector4
export const rotateAround: Behavior = (entityIn: Entity, args: { state: Scalar | Vector2 }, delta: number): void => {
  actor = entityIn.getComponent(Actor)
  transform = entityIn.getComponent(Transform)
  stateValue = entityIn
    .getComponent(State)
    .values.toArray()
    .filter(value => {
      value.type === args.state
    })[0].value
  quat.set(qOut, transform.rotation[0], transform.rotation[1], transform.rotation[2], transform.rotation[3])
  quat.fromEuler(q, stateValue[1] * actor.rotationSpeedY * delta, stateValue[0] * actor.rotationSpeedX * delta, 0)
  quat.mul(qOut, q, qOut)

  transform.rotation = [qOut[0], qOut[1], qOut[2], qOut[3]]

  console.log("rotated")
}
