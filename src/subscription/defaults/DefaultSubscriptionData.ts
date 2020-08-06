import SubscriptionSchema from "../interfaces/SubscriptionSchema"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"
import { updateTransform } from "../../common/defaults/behaviors/updateTransform"

export const DefaultSubscriptionSchema: SubscriptionSchema = {
  onUpdate: [
    {
      behavior: updatePosition
    },
    {
      behavior: updateTransform
    }
  ]
}

export default DefaultSubscriptionSchema
