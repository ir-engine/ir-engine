import { applyGravity } from "../../common/defaults/behaviors/applyGravity"
import { SubscriptionSchema } from "../interfaces/SubscriptionSchema"

export const DefaultSubscriptionSchema: SubscriptionSchema = {
  onUpdate: [
    {
      behavior: applyGravity
    }
  ]
}
