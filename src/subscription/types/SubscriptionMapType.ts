import { createType, Component, copyCopyable, cloneClonable } from "ecsy"
import BehaviorArgValue from "../../common/interfaces/BehaviorArgValue"

export const SubscriptionMapType = createType({
  name: "SubscriptionMapType",
  default: new Map<Component<any>, BehaviorArgValue>(),
  copy: copyCopyable,
  clone: cloneClonable
})
