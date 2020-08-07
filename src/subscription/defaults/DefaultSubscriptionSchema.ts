import SubscriptionSchema from "../interfaces/SubscriptionSchema"
import { applyGravity } from "../../common/defaults/behaviors/applyGravity"

export const DefaultSubscriptionSchema: SubscriptionSchema = {
  onUpdate: [
    {
      behavior: applyGravity
    }
  ]
}

export default DefaultSubscriptionSchema
