import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import InputAlias from "../types/InputAlias"
import { InputType } from "../enums/InputType"

export const debugInput: Behavior = (entity: Entity, args: { input: InputAlias; inputType: InputType; multiplier?: number }): void => {
  console.log("input: " + args.input + " | inputType: " + args.inputType)
}
