import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { Avatar } from "../classes/IKAvatar";
import { Engine } from "../../ecs/classes/Engine";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { IKAvatarComponent } from "../components/IKAvatarComponent";
import { Input } from "../../input/components/Input";
import { XRInputReceiver } from "../../input/components/XRInputReceiver";

export class IKAvatarSystem extends System {

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
    this.queryResults.IKAvatarComponent.added.forEach(entity => {
      const actor = getComponent(entity, CharacterComponent);
      const avatar = getMutableComponent(entity, IKAvatarComponent);
      const avatarIK = new Avatar(actor.modelContainer)
      avatar.avatarIKRig = avatarIK;
      console.log(avatarIK)
      // // actor.modelContainer.visible = false;
    });

    this.queryResults.IKAvatarComponent.removed.forEach(entity => {
      const actor = getComponent(entity, CharacterComponent);
      // // actor.modelContainer.visible = true;
    });

    if(Engine.xrSession) {
      this.queryResults.IKAvatarComponent.all.forEach(entity => {
        const avatar = getMutableComponent(entity, IKAvatarComponent).avatarIKRig;
        const inputs = getComponent(entity, XRInputReceiver);
        avatar.inputs.hmd.position.copy(inputs.headPosition);
        avatar.inputs.hmd.quaternion.copy(inputs.headRotation);
        
        avatar.inputs.leftGamepad.position.copy(inputs.controllerPositionLeft);
        avatar.inputs.leftGamepad.quaternion.copy(inputs.controllerRotationLeft);
        // avatar.inputs.leftGamepad.pointer = ; // for finger animation
        // avatar.inputs.leftGamepad.grip = ;

        avatar.inputs.rightGamepad.position.copy(inputs.controllerPositionRight);
        avatar.inputs.rightGamepad.quaternion.copy(inputs.controllerRotationRight);
        // avatar.inputs.rightGamepad.pointer = ; // for finger animation
        // avatar.inputs.rightGamepad.grip = ;
        
        avatar.update(delta);
      });
    }
  }
}

IKAvatarSystem.queries = {
  IKAvatarComponent: {
    components: [IKAvatarComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
