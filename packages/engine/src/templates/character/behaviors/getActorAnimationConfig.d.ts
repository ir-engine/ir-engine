import { AnimationConfigInterface } from "../CharacterAvatars";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { Entity } from "../../../ecs/classes/Entity";
export declare const getActorAnimationConfig: (entity: Entity, animationId: CharacterAnimationsIds) => AnimationConfigInterface;
