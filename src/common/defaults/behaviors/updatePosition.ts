import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import TransformComponent from "../../../transform/components/TransformComponent"
import { vec3 } from "gl-matrix"

const _output: vec3 = [0, 0, 0]
let transform: TransformComponent

export const updatePosition: Behavior = (entity: Entity, delta: number): void => {
  transform = entity.getMutableComponent(TransformComponent)

  if (vec3.length(transform.velocity as vec3) > 0.001)
    vec3.add(transform.position as vec3, transform.position as vec3, vec3.scale(_output, transform.velocity as vec3, delta))
}
