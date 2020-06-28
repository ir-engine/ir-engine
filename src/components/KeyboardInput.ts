import { Component, Types } from "ecsy"
import { KeyboardInputMap } from "../maps/KeyboardInputMap"

export default class KeyboardInput extends Component<any> {
  keyboardInputActionMap = KeyboardInputMap
}

KeyboardInput.schema = {
  keys: { type: Types.Ref, default: KeyboardInputMap }
}
