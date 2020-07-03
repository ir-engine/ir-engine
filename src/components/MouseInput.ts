import { Component, Types } from "ecsy"

export interface MouseInputPropTypes {
  downHandler: any
  moveHandler: any
  upHandler: any
}

export default class MouseInput extends Component<MouseInputPropTypes> {
  downHandler: any
  moveHandler: any
  upHandler: any
}

MouseInput.schema = {
  downHandler: { type: Types.Ref },
  moveHandler: { type: Types.Ref },
  upHandler: { type: Types.Ref }
}
