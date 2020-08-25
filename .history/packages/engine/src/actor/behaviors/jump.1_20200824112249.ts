import { Behavior } from "../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/Character";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";

export const jump: Behavior = (entity, args: { initJumpSpeed: number; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    character.wantsToJump = true;
    character.initJumpSpeed = args.initJumpSpeed;
};
