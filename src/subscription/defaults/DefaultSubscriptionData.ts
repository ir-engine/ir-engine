import SubscriptionMap from "../interfaces/SubscriptionMap"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"

export const DefaultSubscriptionMap: SubscriptionMap = {
  onUpdate: [
    {
      behavior: updatePosition
    }
  ]
}

export default DefaultSubscriptionMap
