import StateSchema from "../interfaces/StateSchema"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import StateValue from "../interfaces/StateValue"
import StateAlias from "../types/StateAlias"
import { NumericalType } from "../../common/types/NumericalTypes"

export default class State extends BehaviorComponent<StateAlias, StateSchema, StateValue<NumericalType>> {}
