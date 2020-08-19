import { BehaviorComponent } from '../../common/components/BehaviorComponent';
import { BehaviorValue } from '../../common/interfaces/BehaviorValue';
import { SubscriptionSchema } from '../interfaces/SubscriptionSchema';
import { SubscriptionAlias } from '../types/SubscriptionAlias';

export class Subscription extends BehaviorComponent<SubscriptionAlias, SubscriptionSchema, BehaviorValue> {}
