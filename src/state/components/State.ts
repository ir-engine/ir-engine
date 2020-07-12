import { Types } from "ecsy"
import DataComponent from "../../common/components/DataComponent"
import StateData from "../interfaces/StateData"
import DefaultStateGroupData from "../defaults/DefaultStateData"

export default class State extends DataComponent<StateData> {}

State.schema = {
  data: { type: Types.Ref, default: DefaultStateGroupData }
}

// TODO: This is the axis component, copy pattern this component
import AxisValue from "../interfaces/AxisValue"
import { Vector2, Scalar, Vector3 } from "../../common/types/NumericalTypes"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import RingBuffer from "../../common/classes/RingBuffer"
import AxisData from "../interfaces/AxisData"

interface AxisProps {
  data: AxisData
  bufferSize: 10
  values: RingBuffer<AxisValue<Scalar | Vector2 | Vector3>>
}

export default class Axis extends BehaviorComponent<AxisProps, AxisData, AxisValue<Vector2>> {
  data: AxisData
  bufferSize: 10
}



// TODO: Old blendspace, wrap this in too
import RingBuffer from "../../common/classes/RingBuffer"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import StateValue from "../interfaces/StateValue"
import { Vector2 } from "../../common/types/NumericalTypes"

interface PropTypes {
  values: RingBuffer<StateValue<Vector2>>
}

export default class State2D extends BehaviorComponent<PropTypes, StateValue<Vector2>> {}



// TODO: state handler, add values into our behavior component

import RingBuffer from "../../common/classes/RingBuffer"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import StateValue from "../behavior/interfaces/StateValue"

interface PropTypes {
  values: RingBuffer<StateValue>
}

export default class StateHandler extends BehaviorComponent<PropTypes, StateValue> {}

// TODO: State transformation data
import { Types } from "ecsy"
import StateTransformationMap from "../behavior/interfaces/StateData"
import DefaultStateData from "../defaults/DefaultStateBehaviorData"
import DataComponent from "../../common/components/DataComponent"

export default class StateTransformation extends DataComponent<StateTransformationMap> {}

StateTransformation.schema = {
  data: { type: Types.Ref, default: DefaultStateData }
}
