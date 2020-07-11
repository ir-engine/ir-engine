import SubscriptionMap from "../interfaces/SubscriptionMap"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"

export const DefaultDataTransformationData: SubscriptionMap = {
  data: [
    {
      behavior: updatePosition
    }
  ]
}

export default DefaultDataTransformationData
