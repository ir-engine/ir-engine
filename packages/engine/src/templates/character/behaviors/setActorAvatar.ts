import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";

const setActorAvatar: Behavior = (entity, args: { avatarId: string }, delta): void => {
  const characterAvatar = getMutableComponent(entity, CharacterAvatarComponent);
  // console.log('setActorAvatar', args.avatarId);
  if (characterAvatar != null) characterAvatar.avatarId = args.avatarId;
};

export { setActorAvatar };