import { ActionBuffer } from "../classes/ActionBuffer"
import { createType, copyCopyable, cloneClonable } from "ecsy"

export const ActionBufferType = createType<ActionBuffer>({
  name: "ActionBuffer",
  default: new ActionBuffer(5),
  copy: copyCopyable,
  clone: cloneClonable
})

export default ActionBufferType
