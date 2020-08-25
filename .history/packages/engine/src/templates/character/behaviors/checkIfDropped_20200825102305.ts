import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { Behavior } from '../../../common/interfaces/Behavior';

export const checkIfDropped: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (character.rayHasHit)
  {
  if (character.groundImpactData.velocity.y < -6)
  {
    addState(entity, DropRollingState)
  }
  // TODO: This won't really work, need to update
  if (character.velocity.length() > (0.1 * deltaTime)) {
    {
    if (character.groundImpactVelocity.y < -2)
    {
      addState(entity, DropRunningState)
    }
    else
    {
      if (this.character.actions.run.isPressed)
      {
        this.character.setState(new Sprint(this.character));
      }
      else
      {
        this.character.setState(new Walk(this.character));
      }
    }
  }
  else
  {
    this.character.setState(new DropIdle(this.character));
  }
}
}