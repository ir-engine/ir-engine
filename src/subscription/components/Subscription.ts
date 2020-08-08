import SubscriptionSchema from "../interfaces/SubscriptionSchema"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import BehaviorValue from "../../common/interfaces/BehaviorValue"
import SubscriptionAlias from "../types/SubscriptionAlias"

export default class Subscription extends BehaviorComponent<SubscriptionAlias, SubscriptionSchema, BehaviorValue> {}
