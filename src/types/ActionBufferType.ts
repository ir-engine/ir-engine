import { ActionBuffer } from "../classes/ActionBuffer"
import { createType, copyCopyable, cloneClonable } from "ecsy"

// TODO: Add clone etc to action buffer class?

export const ActionBufferType = createType<ActionBuffer>({
  name: "ActionBuffer",
  default: new ActionBuffer(5),
  copy: copyCopyable,
  clone: cloneClonable
})

export default ActionBufferType
