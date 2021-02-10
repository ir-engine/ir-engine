import { CharacterComponent } from '../components/CharacterComponent';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { setState } from "../../../state/behaviors/setState";
import { getSignedAngleBetweenVectors } from '@xr3ngine/engine/src/common/functions/getSignedAngleBetweenVectors';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';

export const setIdleState: Behavior = (entity) => {
  const character = getComponent(entity, CharacterComponent);
  if (character.timer < 0.1) {
    // TODO: Make sure our character orientation is reflected or moved to transform
    const angle = getSignedAngleBetweenVectors(character.orientation, character.orientationTarget);

    if (angle > Math.PI * 0.4) {
      return setState(entity, { state: CharacterStateTypes.IDLE_ROTATE_LEFT });
    }
    else if (angle < -Math.PI * 0.4) {
      return setState(entity, { state: CharacterStateTypes.IDLE_ROTATE_RIGHT });
    }
    else {
      return setState(entity, { state: CharacterStateTypes.DEFAULT });
    }
  }
  else {
    return setState(entity, { state: CharacterStateTypes.DEFAULT });
  }
};
