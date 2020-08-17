import { Vector3 } from "../../common/types/NumericalTypes";
import { Component } from "../../ecs/classes/Component";
interface PropTypes {
    wheelMesh: any;
    convexMesh: any;
    mass: number;
    scale: Vector3;
}
export declare class VehicleBody extends Component<PropTypes> {
    wheelMesh: any;
    convexMesh: any;
    mass: number;
    scale: number[];
}
export {};
