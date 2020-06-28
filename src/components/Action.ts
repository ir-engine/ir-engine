// Place this component on any entity which you would like to recieve input
// Inputs are processed from various devices and converted into actions
import { Component } from "ecsy"
import { ActionBuffer } from "../classes/ActionBuffer"
import ActionBufferType from "../types/ActionBufferType"

export default class UserActionQueue extends Component<any> {
  actions: ActionBuffer
}

UserActionQueue.schema = {
  actions: { type: ActionBufferType, default: new ActionBuffer(10) }
}
