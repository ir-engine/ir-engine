import ActionValue from "../interfaces/ActionValue"
import RingBuffer from "../classes/RingBuffer"
import BufferedComponent from "./BufferedComponent"

interface InputActionProps {
  values: RingBuffer<ActionValue>
}

export default class InputActionHandler extends BufferedComponent<InputActionProps, ActionValue> {}
