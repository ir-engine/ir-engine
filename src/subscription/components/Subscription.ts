import SubscriptionData from "../interfaces/SubscriptionData"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import { Types } from "ecsy"
import DefaultBehaviorData from "../defaults/DefaultSubscriptionData"
import RingBuffer from "../../common/classes/RingBuffer"
import BehaviorArgValue from "../../common/interfaces/BehaviorArgValue"

interface SubscriptionProps {
  data: SubscriptionData
  bufferSize: 10
  values: RingBuffer<BehaviorArgValue>
}

export default class Subscription extends BehaviorComponent<SubscriptionProps, SubscriptionData, BehaviorArgValue> {}

Subscription.schema = {
  data: { type: Types.Ref, default: DefaultBehaviorData },
  bufferSize: { type: Types.Number, default: 10 }
}
