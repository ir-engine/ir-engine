import { Component, createType, copyCopyable, cloneClonable } from "ecsy"
import ActionValue from "../interfaces/ActionValue"
import { RingBuffer } from "./BufferedComponent"
import BufferedComponent from "./BufferedComponent"

export default interface InputActionProps {
  values: RingBuffer<ActionValue>
}

export default class InputActionHandler extends BufferedComponent<InputActionProps, ActionValue> {}
