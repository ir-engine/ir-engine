import { PropTypes } from "ecsy"

export default interface SingleValueSchema {
  value: {
    default: false
    type: PropTypes["Boolean"]
  }
}
