import { Component, Types } from "ecsy"
import { KeyboardInputActionMap } from "../mappings/KeyboardInputActionMap"

export default class KeyboardInput extends Component<any> {
  keyboardInputActionMap = KeyboardInputActionMap
}

KeyboardInput.schema = {
  keys: { type: Types.Ref, default: KeyboardInputActionMap }
}
