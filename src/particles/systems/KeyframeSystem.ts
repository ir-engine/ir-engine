import { getComponent, registerComponent } from "../../ecs"
import { Attributes, System } from "../../ecs/classes/System"
import { Keyframe } from "../components/Keyframe"

export class KeyframeSystem extends System {
  init(attributes?: Attributes): void {
    registerComponent(Keyframe)
  }
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.keyframes.results) {
      const keyframe = getComponent(entity, Keyframe) as Keyframe
      const frameTime = time % keyframe.duration

      for (const attr of keyframe.attributes) {
        // Do something
      }
    }
  }
}

KeyframeSystem.systemQueries = {
  keyframes: {
    components: [Keyframe]
  }
}
