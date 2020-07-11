import RingBuffer from "../../common/classes/RingBuffer"
import BehaviorComponent from "../../common/components/BufferComponent"
import BlendspaceValue from "../interfaces/BlendspaceValue"
import { Vector2 } from "../../common/types/NumericalTypes"

interface PropTypes {
  values: RingBuffer<BlendspaceValue<Vector2>>
}

export default class Blendspace2D extends BehaviorComponent<PropTypes, BlendspaceValue<Vector2>> {}
