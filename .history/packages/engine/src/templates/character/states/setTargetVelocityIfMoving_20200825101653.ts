import { CharacterComponent } from '../../../character/components/CharacterComponent';

export const setTargetVelocityIfMoving: Behavior = (entity, args: { ifTrue: { x: number; y: number; z: number; }; ifFalse?: { x: number; y: number; z: number; }; }, deltaTime) => {
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  // TODO: This won't work if we're falling fast, we need to know if our player is trying to move 
  if (character.velocity.length() > (0.1 * deltaTime)) {
    console.log("Change state to walking forward");
    character.velocityTarget = args.ifTrue;
  }
  else if (args.ifFalse !== undefined)
    character.velocityTarget = args.ifFalse;
};
