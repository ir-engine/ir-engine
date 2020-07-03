// Should be a singleton, we only need one in our world

import { Component, Types } from "ecsy"
import DefaultInputMap from "../defaults/DefaultInputMap"
import InputMap from "../interfaces/InputMap"

export default class UserInput extends Component<any> {
  inputMap: InputMap = DefaultInputMap
}

UserInput.schema = {
  data: { type: Types.Ref, default: DefaultInputMap }
}
