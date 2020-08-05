import { Component, Types } from "ecsy"
import TransformComponent from "./TransformComponent"

export default class TransformParent extends Component<any> {
  children: TransformComponent[] = []
}
TransformParent.schema = {
  value: { default: [], type: Types.Array }
}
