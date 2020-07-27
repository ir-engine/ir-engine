import { Component, Types } from "ecsy"

interface PropTypes {
  networkId: number
  ownerId: number
}

export default class NetworkObject extends Component<PropTypes> {}

NetworkObject.schema = {
  ownerId: { type: Types.Number },
  networkId: { type: Types.Number }
}
