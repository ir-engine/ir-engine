import { System, SystemAttributes } from "../ecs/classes/System";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "../templates/character/components/CharacterComponent";
import { updateCharacterState } from "./functions/updateCharacterState";
import { getComponent } from "../ecs/functions/EntityFunctions";
import { physicsMove } from "../physics/behaviors/physicsMove";


export class CharacterControllerSystem extends System {

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
    this.queryResults.character.all.forEach((entity) => {
      const actor = getComponent(entity, CharacterComponent)
      updateCharacterState(entity, delta)
      if(actor.movementEnabled) {
        physicsMove(entity, {}, delta)
      }
    })

    this.queryResults.animation.all.forEach((entity) => {
      updateVectorAnimation(entity, delta)
    })
  }
}

CharacterControllerSystem.queries = {
  character: {
    components: [CharacterComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  animation: {
    components: [AnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
