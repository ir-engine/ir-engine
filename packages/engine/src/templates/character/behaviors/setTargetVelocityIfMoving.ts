import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';

export const setTargetVelocityIfMoving: Behavior = (entity, args: { ifTrue: { x: number; y: number; z: number }; ifFalse?: { x: number; y: number; z: number } }, deltaTime) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  if(getComponent(entity, CharacterComponent).localMovementDirection.length() > 0) {
    actor.velocityTarget.set(args.ifTrue.x, args.ifTrue.y, args.ifTrue.z);
  }
  else if (args.ifFalse !== undefined){
    actor.velocityTarget.x = args.ifFalse.x;
    actor.velocityTarget.y = args.ifFalse.y;
    actor.velocityTarget.z = args.ifFalse.z;

  }
};
