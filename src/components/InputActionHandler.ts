import { Component, createType, copyCopyable, cloneClonable } from "ecsy"
import ActionType from "../types/ActionType"
import { RingBuffer } from "../classes/RingBuffer"
import ActionValue from "../interfaces/ActionValue"

export default interface InputActionProps {
  action: ActionType
  value: ActionValue
}

export default class InputActionHandler extends Component<InputActionProps> {
  queue: RingBuffer<ActionValue>
  schema = {
    queue: { type: ActionBufferType }
  }
}

export const ActionBufferType = createType<RingBuffer<ActionValue>>({
  name: "ActionBuffer",
  default: new RingBuffer<ActionValue>(10),
  copy: copyCopyable,
  clone: cloneClonable
})
