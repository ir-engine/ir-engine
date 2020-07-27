import { Component, Types } from "ecsy"

interface PropTypes {
  networkId: number
  userId: string
  name: string
}

export default class NetworkPlayer extends Component<PropTypes> {}

NetworkPlayer.schema = {
  networkId: { type: Types.Number },
  userId: { type: Types.String, default: "" },
  name: { type: Types.String, default: "Player" }
}
