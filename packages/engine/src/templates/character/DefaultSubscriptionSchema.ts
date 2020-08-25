import { applyGravity } from '../../common/defaults/behaviors/applyGravity';
import { SubscriptionSchema } from '../../subscription/interfaces/SubscriptionSchema';

export const DefaultSubscriptionSchema: SubscriptionSchema = {
  onUpdate: [
    {
      behavior: applyGravity
    }
  ]
};
