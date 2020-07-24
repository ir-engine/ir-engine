import SubscriptionSchema from "../interfaces/SubscriptionSchema"
import { updatePosition } from "../../common/defaults/behaviors/updatePosition"

export const DefaultSubscriptionSchema: SubscriptionSchema = {
  onUpdate: [
    {
      behavior: updatePosition
    }
  ]
}

export default DefaultSubscriptionSchema
