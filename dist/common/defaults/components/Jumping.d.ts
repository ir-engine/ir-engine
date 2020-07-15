import { Component } from "ecsy";
interface PropTypes {
    t: number;
    height: number;
    duration: number;
}
export default class Jumping extends Component<PropTypes> {
    t: number;
    height: number;
    duration: number;
}
export {};
