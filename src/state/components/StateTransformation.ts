import { Types } from "ecsy"
import StateTransformationMap from "../behavior/interfaces/StateBehaviorMap"
import DefaultStateTransformationData from "../defaults/DefaultStateBehaviorData"
import DataComponent from "../../common/components/DataComponent"

export default class StateTransformation extends DataComponent<StateTransformationMap> {}

StateTransformation.schema = {
  data: { type: Types.Ref, default: DefaultStateTransformationData }
}
