interface behaviorEntry {
}
export interface SubscriptionMap {
    onAdded?: behaviorEntry[];
    onChanged?: behaviorEntry[];
    onRemoved?: behaviorEntry[];
    onUpdate?: behaviorEntry[];
    onLateUpdate?: behaviorEntry[];
}
export default SubscriptionMap;
