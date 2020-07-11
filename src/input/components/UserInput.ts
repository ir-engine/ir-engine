// Should be a singleton, we only need one in our world

import { Component, Types } from "ecsy"
import DefaultInputActionTable from "../defaults/DefaultInputActionTable"
import InputActionTable from "../interfaces/InputActionTable"

export default class UserInput extends Component<any> {
  inputMap: InputActionTable = DefaultInputActionTable
}

UserInput.schema = {
  data: { type: Types.Ref, default: DefaultInputActionTable }
}
