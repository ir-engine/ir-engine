import { RaycastVehicle, Vec3 } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
export declare class VehicleBody extends Component<VehicleBody> {
    currentDriver: any;
    vehicleMesh: any;
    vehiclePhysics: RaycastVehicle;
    vehicleCollider: any;
    vehicleSphereColliders: any;
    vehicleDoorsArray: any;
    startPosition: any;
    suspensionRestLength: any;
    colliderTrimOffset: Vec3;
    collidersSphereOffset: Vec3;
    arrayWheelsMesh: any;
    arrayWheelsPosition: any;
    wheelRadius: number;
    entrancesArray: any;
    seatsArray: any;
    maxSteerVal: number;
    maxForce: number;
    brakeForce: number;
    mass: number;
    vehicle: RaycastVehicle;
}
