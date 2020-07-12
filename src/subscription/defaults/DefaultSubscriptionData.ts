import SubscriptionMap from "../interfaces/SubscriptionData"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"

export const DefaultDataTransformationData: SubscriptionMap = {
  onUpdate: [
    {
      behavior: updatePosition
    }
  ]
}

export default DefaultDataTransformationData
