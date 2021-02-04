import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { Entity } from "../../../ecs/classes/Entity";

export const getActorAnimationConfig = (entity: Entity, animationId: CharacterAnimationsIds): AnimationConfigInterface => {
  const avatarId = getComponent(entity, CharacterAvatarComponent)?.avatarId;
  const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;

  return avatarAnimations[animationId];
};
