import { createType, Component, copyCopyable, cloneClonable } from "ecsy"
import SubscriptionMapValue from "../interfaces/SubscriptionMapValue"

export const DataTransformationMapType = createType({
  name: "DataTransformationMapType",
  default: new Map<Component<any>, SubscriptionMapValue>(),
  copy: copyCopyable,
  clone: cloneClonable
})
