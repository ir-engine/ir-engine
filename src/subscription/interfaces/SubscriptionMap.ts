interface behaviorEntry = {
  behavior: any
  args?: any
}

export interface SubscriptionMap {
  onAdded?: behaviorEntry[]
  onChanged?: behaviorEntry[]
  onRemoved?: behaviorEntry[]
  onUpdate?: behaviorEntry[]
  onLateUpdate?: behaviorEntry[]
}

export default SubscriptionMap
