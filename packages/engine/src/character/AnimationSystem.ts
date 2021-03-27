import { System, SystemAttributes } from "../ecs/classes/System";
import { getComponent } from "../ecs/functions/EntityFunctions";
import { State } from "../state/components/State";
import { updateVectorAnimation } from "../templates/character/behaviors/updateVectorAnimation";
import { AnimationComponent } from "./components/AnimationComponent";

export class AnimationSystem extends System {

  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.animation.added.forEach((entity) => {
      console.log(getComponent(entity, AnimationComponent))
    })
    this.queryResults.animation.all.forEach((entity) => {
      updateVectorAnimation(entity, delta)
    })
  }
}

AnimationSystem.queries = {
  animation: {
    components: [AnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
