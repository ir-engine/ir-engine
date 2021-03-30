import { System, SystemAttributes } from "../../ecs/classes/System";
import { EquippableComponent } from "../components/EquippableComponent";

export class EquippableSystem extends System {

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
    this.queryResults.equipped.all.forEach((entity) => {

    })
  }
}

EquippableSystem.queries = {
  equipped: {
    components: [EquippableComponent],
    listen: {
      added: true,
      removed: true
    }
  }
};
