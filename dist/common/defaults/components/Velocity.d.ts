import { Component } from "ecsy";
interface PropTypes {
    x: number;
    y: number;
    z: number;
}
export default class Velocity extends Component<PropTypes> {
    x: 0;
    y: 0;
    z: 0;
}
export {};
