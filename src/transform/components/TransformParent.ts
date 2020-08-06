import { Component, Types } from "ecsy"
import Transform from "./Transform"

export default class TransformParent extends Component<any> {
  children: Transform[] = []
}
TransformParent.schema = {
  value: { default: [], type: Types.Array }
}
