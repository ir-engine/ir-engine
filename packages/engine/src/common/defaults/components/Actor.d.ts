import { Component } from "../../../ecs/classes/Component";
interface JumpPropTypes {
    canJump: boolean;
    t?: number;
    force?: number;
    duration?: number;
}
interface PropTypes {
    rotationSpeedX: number;
    rotationSpeedY: number;
    maxSpeed: number;
    accelerationSpeed: number;
    decelerationSpeed: number;
    jumpData: JumpPropTypes;
}
export declare class Actor extends Component<PropTypes> {
    rotationSpeedX: number;
    rotationSpeedY: number;
    maxSpeed: number;
    accelerationSpeed: number;
    decelerationSpeed: number;
    rotationSpeedZ: number;
    jump: JumpPropTypes;
    copy(src: this): this;
    reset(): void;
}
export {};
