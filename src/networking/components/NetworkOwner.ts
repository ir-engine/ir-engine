import { Component, Types, Entity } from "ecsy"

interface PropTypes {
  value: Entity
}

export default class NetworkOwner extends Component<PropTypes> {}

NetworkOwner.schema = {
  value: { type: Types.Ref }
}
