import AxisValue from "../interfaces/AxisValue"
import { Vector2, Scalar, Vector3 } from "../../common/types/NumericalTypes"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import AxisMap from "../interfaces/AxisData"
import AxisAlias from "../types/AxisAlias"

export default class Axis extends BehaviorComponent<AxisAlias, AxisMap, AxisValue<Scalar | Vector2 | Vector3>> {}
