import { RaycastVehicle } from 'cannon-es';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
export declare const VehicleBehavior: Behavior;
export declare function createVehicleBody(entity: Entity): RaycastVehicle;
