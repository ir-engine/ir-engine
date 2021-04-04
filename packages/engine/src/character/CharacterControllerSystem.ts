import { System, SystemAttributes } from "../ecs/classes/System";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "../templates/character/components/CharacterComponent";
import { updateCharacterOrientation } from "./functions/updateCharacterOrientation";
import { getComponent, getMutableComponent } from "../ecs/functions/EntityFunctions";
import { physicsMove } from "../physics/behaviors/physicsMove";
import { IKComponent } from "./components/IKComponent";
import { Input } from "../input/components/Input";
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
      
      updateCharacterOrientation(entity, delta)
      if(actor.movementEnabled) {
        physicsMove(entity, {}, delta)
      }
    })

    this.queryResults.animation.all.forEach((entity) => {
      updateVectorAnimation(entity, delta)
    })

    this.queryResults.ikavatar.all.forEach((entity) => {
      const ikComponent = getMutableComponent(entity, IKComponent);
      if(ikComponent.avatarIKRig) {
        ikComponent.avatarIKRig.update(delta);
      }
    })
  }
}

CharacterControllerSystem.queries = {
  character: {
    components: [CharacterComponent, Input],
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
  ikavatar: {
    components: [IKComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
