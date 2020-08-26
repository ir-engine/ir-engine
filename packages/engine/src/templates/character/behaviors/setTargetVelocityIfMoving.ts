import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';

export const setTargetVelocityIfMoving: Behavior = (entity, args: { ifTrue: { x: number; y: number; z: number; }; ifFalse?: { x: number; y: number; z: number; }; }, deltaTime) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return
  // TODO: This won't work if we're falling fast, we need to know if our player is trying to move 
  if (actor.velocity.length() > (0.1 * deltaTime)) {
    console.log("Change state to walking forward");
    actor.velocityTarget.set(args.ifTrue.x, args.ifTrue.y, args.ifTrue.z)
  }
  else if (args.ifFalse !== undefined){
    actor.velocityTarget.x = args.ifFalse.x
    actor.velocityTarget.y = args.ifFalse.y
    actor.velocityTarget.z = args.ifFalse.z

  }
};
