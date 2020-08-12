import { Attributes, System } from "../../ecs/System"
import { Keyframe } from "../components/Keyframe"

export class KeyframeSystem extends System {
  init(attributes?: Attributes): void {
    throw new Error("Method not implemented.")
  }
  execute(deltaTime, time): void {
    for (const entity of this.queries.keyframes.results) {
      const keyframe = entity.getComponent(Keyframe) as Keyframe
      const frameTime = time % keyframe.duration

      for (const attr of keyframe.attributes) {
        // Do something
      }
    }
  }
}

KeyframeSystem.queries = {
  keyframes: {
    components: [Keyframe]
  }
}
