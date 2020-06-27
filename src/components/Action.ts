// Place this component on any entity which you would like to recieve input
// Inputs are processed from various devices and converted into actions
import { Component } from "ecsy"
import { ActionBufferType, ActionBuffer } from "../types/ActionBuffer"

export default class Action extends Component<any> {}

Action.schema = {
  actions: { type: ActionBufferType, default: new ActionBuffer(5) }
}
