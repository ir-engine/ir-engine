export interface SubscriptionData {
  onUpdate?: [
    {
      behavior: any
      args?: any
    }
  ]
  onLateUpdate?: [
    {
      behavior: any
      args?: any
    }
  ]
}

export default SubscriptionData
