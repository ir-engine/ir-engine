import { System } from "../../ecs/classes/System";
import { IKAvatarLegs } from "../components/IKAvatarLegs";
import { IKAvatarRig } from "../components/IKAvatarRig";
import IKAvatarArms from "../components/IKAvatarArms";
import { initializeAvatarRig, updateAvatarLegs, updateAvatarShoulders } from "../functions/AvatarBodyFunctions";

export class AvatarRigSystem extends System {

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.avatarRig.added?.forEach((entity) => {
     initializeAvatarRig(entity);
    });

    this.queryResults.avatarRig.all?.forEach((entity) => {
      updateAvatarShoulders(entity, delta);
      updateAvatarLegs(entity, delta);
     });

    // this.queryResults.avatarWithShoulders.all?.forEach((entity) => {
    //   updateAvatarShoulders(entity, delta);
    // });

    // this.queryResults.avatarWithLegs.all?.forEach((entity) => {
    //   updateAvatarLegs(entity, delta);
    // });
  }
}

AvatarRigSystem.queries = {
  avatarRig: {
    components: [IKAvatarRig, IKAvatarLegs, IKAvatarArms],
    listen: {
      added: true,
      removed: true
    }
  },
  // avatarWithLegs: {
  //   components: [IKAvatarRig, ],
  //   listen: {
  //     added: true,
  //     removed: true
  //   }
  // },
  // avatarWithShoulders: {
  //   components: [IKAvatarRig, IKAvatarArms],
  //   listen: {
  //     added: true,
  //     removed: true
  //   }
  // }
};