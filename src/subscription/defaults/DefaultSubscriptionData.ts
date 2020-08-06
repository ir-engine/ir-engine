import SubscriptionMap from "../interfaces/SubscriptionMap"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"
import { updateObject3D } from "../../common/defaults/behaviors/updateObject3D"

export const DefaultSubscriptionMap: SubscriptionMap = {
  onUpdate: [
    {
      behavior: updatePosition
    },
    {
      behavior: updateObject3D
    }
  ]
}

export default DefaultSubscriptionMap
