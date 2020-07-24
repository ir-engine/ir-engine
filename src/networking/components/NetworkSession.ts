import { Component, Types } from "ecsy"

interface PropTypes {
  transport: Transport
}

export default class NetworkSession extends Component<PropTypes> {}

NetworkSession.schema = {
  transport: { type: Types.Ref }
}
