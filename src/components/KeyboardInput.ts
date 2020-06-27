import { Component } from "ecsy"
import { KeyState } from "../types/KeyState"

export default class KeyboardInput extends Component<any> {
  keys: any[]
}

KeyboardInput.schema = {
  keys: { type: KeyState }
}
