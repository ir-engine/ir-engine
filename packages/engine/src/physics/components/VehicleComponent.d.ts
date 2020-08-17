import { RaycastVehicle } from "cannon-es/src/objects/RaycastVehicle";
import { Component } from "../../ecs/classes/Component";
export declare class VehicleComponent extends Component<any> {
    maxSteerVal: number;
    maxForce: number;
    brakeForce: number;
    vehicle: RaycastVehicle;
}
