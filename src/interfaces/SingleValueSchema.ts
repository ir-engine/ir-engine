import { Types } from "ecsy"

export default interface SingleValueSchema {
  value: {
    default: false
    type: Types["Boolean"]
  }
}
