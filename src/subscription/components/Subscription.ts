import SubscriptionMap from "../interfaces/SubscriptionMap"
import DataComponent from "../../common/components/DataComponent"
import { Types } from "ecsy"
import DefaultBehaviorData from "../defaults/DefaultSubscriptionData"

export default class Subscription extends DataComponent<SubscriptionMap> {}

Subscription.schema = {
  data: { type: Types.Ref, default: DefaultBehaviorData }
}
