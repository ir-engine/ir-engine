import SubscriptionMap from "../interfaces/SubscriptionMap"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"
import { updateTransform } from "../../common/defaults/behaviors/updateTransform"

export const DefaultSubscriptionMap: SubscriptionMap = {
  onUpdate: [
    {
      behavior: updatePosition
    },
    {
      behavior: updateTransform
    }
  ]
}

export default DefaultSubscriptionMap
