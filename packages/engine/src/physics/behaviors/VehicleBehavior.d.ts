import { Quaternion } from "cannon-es/src/math/Quaternion";
import { Behavior } from "../../common/interfaces/Behavior";
import { RaycastVehicle } from "cannon-es/src/objects/RaycastVehicle";
import { Body } from "cannon-es/src/objects/Body";
export declare const quaternion: Quaternion;
import { Entity } from "../../ecs/classes/Entity";
export declare const VehicleBehavior: Behavior;
export declare function _createVehicleBody(entity: Entity, mesh: any): [RaycastVehicle, Body[]];
