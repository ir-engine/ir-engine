// TODO: Clean me up, add schema, etc
import { Component } from "ecsy"
import NetworkTransport from "../interfaces/NetworkTransport"

export default class NetworkTransportComponent extends Component<any> {
  static instance: NetworkTransportComponent
  transport: NetworkTransport
  initialized = false
  constructor() {
    super()
    NetworkTransportComponent.instance = this
  }
}
