import { Component, Types } from "ecsy"
import { KeyboardInputMap } from "../maps/KeyboardInputMap"

export default class KeyboardInput extends Component<any> {
  inputMap = KeyboardInputMap
}

KeyboardInput.schema = {
  inputMap: { type: Types.Ref, default: KeyboardInputMap }
}
