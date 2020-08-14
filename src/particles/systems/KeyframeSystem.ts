import { Attributes, System } from "../../ecs/classes/System"
import { Keyframe } from "../components/Keyframe"
import { registerComponent, getComponent } from "../../ecs"

export class KeyframeSystem extends System {
  init(attributes?: Attributes): void {
    registerComponent(Keyframe)
  }
  execute(deltaTime, time): void {
    for (const entity of this.queries.keyframes.results) {
      const keyframe = getComponent(entity, Keyframe) as Keyframe
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
