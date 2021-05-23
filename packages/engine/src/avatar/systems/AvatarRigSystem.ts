import { isClient } from "../../common/functions/isClient";
import { System } from "../../ecs/classes/System";
import { IKAvatarRig } from "../components/IKAvatarRig";
import { initializeAvatarRig, updateAvatarLegs, updateAvatarShoulders } from "../functions/AvatarBodyFunctions";

export default class AvatarRigSystem extends System {

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.avatarRig.added?.forEach((entity) => {
     // initializeAvatarRig(entity);
    });

    this.queryResults.avatarRig.all?.forEach((entity) => {
      if(!isClient) return;
      updateAvatarShoulders(entity, delta);
      updateAvatarLegs(entity, delta);
     });
  }
}

AvatarRigSystem.queries = {
  avatarRig: {
    components: [IKAvatarRig],
    listen: {
      added: true,
      removed: true
    }
  }
};