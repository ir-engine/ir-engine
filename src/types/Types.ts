import { createType } from "ecsy"

import { ActionBuffer } from "../utils/RingBuffer"

export const Types = {
  Number: createType({
    name: "ActionBuffer",
    default: new ActionBuffer(5),
    copy: (src: ActionBuffer) => ActionBuffer.copy(src),
    clone: (src: ActionBuffer) => ActionBuffer.clone(src)
  })
}
