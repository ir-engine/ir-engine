import { System } from "../../ecs/classes/System";
import { AvatarLegs } from "../components/AvatarLegs";
import AvatarShoulders from "../components/AvatarShoulders";
import { XRAvatarRig } from "../components/XRAvatarRig";
import { Side } from "../enums/Side";
import { initAvatarLegs, initAvatarShoulders, initializeAvatarRig, updateAvatarLegs, updateXRArmIK } from "../functions/AvatarBodyFunctions";

export class AvatarRigSystem extends System {

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.avatarRig.added?.forEach((entity) => {
     initializeAvatarRig(entity);
    });

    this.queryResults.avatarWithShoulders.added?.forEach((entity) => {
      initAvatarShoulders(entity);
    });

    this.queryResults.avatarWithLegs.added?.forEach((entity) => {
      initAvatarLegs(entity);
    });


    this.queryResults.avatarWithShoulders.all?.forEach((entity) => {
      updateXRArmIK(entity, Side.Left);
      updateXRArmIK(entity, Side.Right);
    });

    this.queryResults.avatarWithLegs.all?.forEach((entity) => {
      updateAvatarLegs(entity);
    });
  }
}

AvatarRigSystem.queries = {
  avatarRig: {
    components: [XRAvatarRig],
    listen: {
      added: true,
      removed: true
    }
  },
  avatarWithLegs: {
    components: [XRAvatarRig, AvatarLegs],
    listen: {
      added: true,
      removed: true
    }
  },
  avatarWithShoulders: {
    components: [XRAvatarRig, AvatarShoulders],
    listen: {
      added: true,
      removed: true
    }
  }
};