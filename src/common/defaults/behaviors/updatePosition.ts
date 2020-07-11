import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"
import { Transform } from "../components/Transform"
import { vec3 } from "gl-matrix"

const _output: vec3 = [0, 0, 0]
let transform: Transform

export const updatePosition: Behavior = (entityIn: Entity, delta: number): void => {
  transform = entityIn.getComponent(Transform)

  if (vec3.length(transform.velocity as vec3) > 0.001)
    vec3.add(transform.position as vec3, transform.position as vec3, vec3.scale(_output, transform.velocity as vec3, delta))

  console.log("updatePosition")
}
