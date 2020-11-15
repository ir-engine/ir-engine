import { SubscriptionSchema } from '../../subscription/interfaces/SubscriptionSchema';
import { updateCharacter } from './behaviors/updateCharacter';

export const CharacterSubscriptionSchema: SubscriptionSchema = {
  onUpdate: [
    // {
    //  behavior: updateCharacter
    // }
  ]
};

