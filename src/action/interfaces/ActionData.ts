import BlendspaceType from "../../state/types/BlendspaceType"
import SubscriptionMapValue from "../../subscription/interfaces/SubscriptionMapValue"

interface BlendBehaviorData extends SubscriptionMapValue {
  args: { blendspace: BlendspaceType }
}

export interface ActionStateData {
  actions: {
    // Action
    [key: string]: {
      // switch state (on, off)
      [key: string]: {
        behavior: any
        args?: any
      }
    }
  }
  axes: {
    [key: number]: BlendBehaviorData
  }
}

export default ActionStateData
