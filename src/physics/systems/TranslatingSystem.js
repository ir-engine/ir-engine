// TODO: Convert to behavior / remove / should affect our Transform component

class Translating extends Component {}
Translating.schema = {
  x: { type: Types.Number, default: 0 },
  y: { type: Types.Number, default: 0 },
  z: { type: Types.Number, default: 0 }
}

class TranslatingSystem extends System {
  execute(dt, t) {
    for (let entity of this.queries.translating.results) {
      const translating = entity.getComponent(Translating)
      const transform = entity.getMutableComponent(Transform)
      transform.position.x += translating.x * dt
      transform.position.y += translating.y * dt
      transform.position.z += translating.z * dt
    }
  }
}

TranslatingSystem.queries = {
  translating: {
    components: [Translating, Transform]
  }
}
