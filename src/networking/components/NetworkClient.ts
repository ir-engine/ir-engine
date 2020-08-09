// Todo: Attach stuff to be like inventory, etc, later, and use me!
import { Component, Types } from "ecsy"

interface PropTypes {
  networkId: number
  userId: string
  name: string
}

export class NetworkClient extends Component<PropTypes> {}

NetworkClient.schema = {
  networkId: { type: Types.Number },
  userId: { type: Types.String, default: "" },
  name: { type: Types.String, default: "Player" }
}
