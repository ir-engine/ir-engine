import { CharacterComponent } from "../components/CharacterComponent";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions";

let actor: CharacterComponent;
let transform: TransformComponent;

export const jump: Behavior = (entity, args: { initJumpSpeed: number; }): void => {
  const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  character.wantsToJump = true;
  character.initJumpSpeed = args.initJumpSpeed;
};


export const jumping: Behavior = (entity: Entity, args, delta: any): void => {
  transform = getComponent<TransformComponent>(entity, TransformComponent);
  actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  
  
};
