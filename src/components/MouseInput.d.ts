import { Component } from "ecsy";
export interface MouseInputPropTypes {
    downHandler: any;
    moveHandler: any;
    upHandler: any;
}
export default class MouseInput extends Component<MouseInputPropTypes> {
    downHandler: any;
    moveHandler: any;
    upHandler: any;
}
