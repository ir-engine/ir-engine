import { Component } from "ecsy";
import NetworkTransport from "../interfaces/NetworkTransport";
export default class NetworkTransportComponent extends Component<any> {
    static instance: NetworkTransportComponent;
    transport: NetworkTransport;
    initialized: boolean;
}
