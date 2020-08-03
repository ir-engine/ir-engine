import { System } from "ecsy"
import { Keyframe } from "../components/Keyframe"
export class KeyframeSystem extends System {
  execute(deltaTime, time): void {
    for (const entity of this.queries.keyframes.results) {
      const keyframe = entity.getComponent(Keyframe)
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
