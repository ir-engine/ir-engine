export class Rotating extends Component {}
Rotating.schema = {
  x: { type: Types.Number, default: 0 },
  y: { type: Types.Number, default: 0 },
  z: { type: Types.Number, default: 0 }
}

export class RotatingSystem extends System {
  execute(dt) {
    for (let entity of this.queries.rotating.results) {
      const rotating = entity.getComponent(Rotating)
      const transform = entity.getMutableComponent(Transform)
      transform.rotation.x += rotating.x * dt * MathUtils.DEG2RAD
      transform.rotation.y += rotating.y * dt * MathUtils.DEG2RAD
      transform.rotation.z += rotating.z * dt * MathUtils.DEG2RAD
    }
  }
}

RotatingSystem.queries = {
  rotating: {
    components: [Rotating, Transform]
  }
}
