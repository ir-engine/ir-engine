import { Component } from "ecsy";
export default interface GamepadInputPropTypes {
    connected: boolean;
    threshold: number;
}
export default class GamepadInput extends Component<GamepadInputPropTypes> {
    connected: boolean;
    threshold: number;
}
