import { AxisBuffer } from "../classes/AxisBuffer"
import { createType, copyCopyable, cloneClonable } from "ecsy"

export const AxisBufferType = createType<AxisBuffer>({
  name: "ActionBuffer",
  default: new AxisBuffer(5),
  copy: copyCopyable,
  clone: cloneClonable
})

export default AxisBufferType
