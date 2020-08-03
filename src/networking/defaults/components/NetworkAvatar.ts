import { Component, Types } from "ecsy"

interface PropTypes {
  ownerId: number
  isLocalPlayer: boolean
}

export default class NetworkAvatar extends Component<PropTypes> {}

NetworkAvatar.schema = {
  ownerId: { type: Types.Number },
  isLocalPlayer: { type: Types.Boolean }
}
