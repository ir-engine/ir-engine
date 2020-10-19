import { Behavior } from "../../../common/interfaces/Behavior";
import { addComponent } from "../../../ecs/functions/EntityFunctions";
import { PlaySoundEffect } from "../../../audio/components/PlaySoundEffect";

export const honk: Behavior = entity => {
  // get honk entity of vehicle and add SoundEffect there
  // addComponent(honkEntity, PlaySoundEffect)
};