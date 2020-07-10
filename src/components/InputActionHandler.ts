import ActionValue from "../interfaces/ActionValue"
import RingBuffer from "../classes/RingBuffer"
import BufferComponent from "./BufferComponent"

interface InputActionProps {
  values: RingBuffer<ActionValue>
}

export default class InputActionHandler extends BufferComponent<InputActionProps, ActionValue> {}
