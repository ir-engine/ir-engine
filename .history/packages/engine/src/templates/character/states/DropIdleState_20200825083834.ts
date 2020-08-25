import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation, checkFalling } from '../CharacterStateSchema';
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { DefaultStateGroups } from '../CharacterStateGroups';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';

// Idle Behavior
export const DropIdleState: StateSchemaValue = {
  group: DefaultStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.5,
      ['velocitySimulator.mass']: 7,
      ['velocityTarget']: { x: 0, y: 0, z: 0 },
    }
  },
  onEntry: {
    any: [
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setCharacterAnimation,
        args: {
          name: 'drop_idle',
          transitionDuration: 0.1
        }
      }
  ]
},
  onUpdate: [
    { behavior: updateCharacterState },
    { behavior: checkFalling },
    { behavior: onAnimationEnded,
      args:  {
        transitionTo: Idle
      }
  }]
};

/// On Animation ended
export const onAnimationEnded: Behavior = (entity: Entity, args: { transitionTo: any}, deltaTime) => {
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any)
  if(character.timer > character.currentAnimationLength - deltaTime){
    addSta
  }
}
