import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../../../templates/character/components/CharacterComponent";
import { getMutableComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Vector3, Object3D } from "three";
import { ClosestObjectFinder } from "../../../templates/character/components/ClosestObjectFinder";
import { Vehicle } from "../components/Vehicle";
import { Engine } from "../../../ecs/classes/Engine";
import { VehicleEntryInstance } from "../classes/VehicleEntryInstance";
import { VehicleSeat } from "../components/VehicleSeat";
import { SeatType } from "../enums/SeatType";
import { Entity } from "../../../ecs/classes/Entity";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { rotateModel } from "../../../templates/character/behaviors/rotateModel";
import { resetVelocity } from "../../../templates/character/behaviors/resetVelocity";
import { setPosition } from "../../../templates/character/behaviors/setPosition";
import { setPhysicsEnabled } from "../../../templates/character/behaviors/setPhysicsEnabled";

export const findVehicleToEnter: Behavior = (entity, args: { wantsToDrive: boolean; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    const characterTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
    // reusable world position variable
    let worldPos = new Vector3();

    // Find best vehicle
    let vehicleFinder = new ClosestObjectFinder<Vehicle>(characterTransform.position, 10);
    Engine.vehicles.forEach((vehicle) => {
        vehicleFinder.consider(vehicle, vehicle.position);
    });

    if (vehicleFinder.closestObject !== undefined) {
        let vehicle = vehicleFinder.closestObject;
        let vehicleEntryInstance = new VehicleEntryInstance(character);
        vehicleEntryInstance.wantsToDrive = args.wantsToDrive;

        // Find best seat
        let seatFinder = new ClosestObjectFinder<VehicleSeat>(characterTransform.position);
        for (const seat of vehicle.seats) {
            if (args.wantsToDrive) {
                // Consider driver seats
                if (seat.type === SeatType.Driver) {
                    seat.seatPointObject.getWorldPosition(worldPos);
                    seatFinder.consider(seat, worldPos);
                }
                // Consider passenger seats connected to driver seats
                else if (seat.type === SeatType.Passenger) {
                    for (const connSeat of seat.connectedSeats) {
                        if (connSeat.type === SeatType.Driver) {
                            seat.seatPointObject.getWorldPosition(worldPos);
                            seatFinder.consider(seat, worldPos);
                            break;
                        }
                    }
                }
            }
            else {
                // Consider passenger seats
                if (seat.type === SeatType.Passenger) {
                    seat.seatPointObject.getWorldPosition(worldPos);
                    seatFinder.consider(seat, worldPos);
                }
            }
        }

        if (seatFinder.closestObject !== undefined) {
            let targetSeat = seatFinder.closestObject;
            vehicleEntryInstance.targetSeat = targetSeat;

            let entryPointFinder = new ClosestObjectFinder<Object3D>(characterTransform.position);

            for (const point of targetSeat.entryPoints) {
                point.getWorldPosition(worldPos);
                entryPointFinder.consider(point, worldPos);
            }

            if (entryPointFinder.closestObject !== undefined) {
                vehicleEntryInstance.entryPoint = entryPointFinder.closestObject;
                // triggerAction('up', true);
                character.vehicleEntryInstance = vehicleEntryInstance;
            }
        }
    }
};

export const enterVehicle: Behavior = (entity, args: { seat: VehicleSeat; entryPoint: Object3D; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    // if (args.seat.door?.rotation < 0.5) {
    //     setState(entity, { state: new OpenVehicleDoor(character, args.seat, args.entryPoint) });
    // }
    // else {
    //     setState(entity, { state: new EnteringVehicle(character, args.seat, args.entryPoint) });
    // }
};

export const teleportToVehicle: Behavior = (entity: Entity, args: { vehicle: Vehicle; seat: VehicleSeat; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    const characterObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);

    resetVelocity(entity);
    rotateModel(entity);
    setPhysicsEnabled(entity, false);
    // TODO: Attach is object3d
    // args.vehicle.attach(characterObject3D.value);

    // setPosition(entity, { x: args.seat.seatPointObject.position.x, y: args.seat.seatPointObject.position.y + 0.6, z: args.seat.seatPointObject.position.z });
    // character.quaternion.copy(args.seat.seatPointObject.quaternion);

    // occupySeat(entity, args.seat);
    // setState(entity, { state: new Driving(character, args.seat) });

    // startControllingVehicle(entity, { vehicle: args.vehicle, seat: args.seat });
};

export const startControllingVehicle: Behavior = (entity, args: { vehicle: any; seat: VehicleSeat; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    // if (character.controlledObject !== vehicle)
    // {
    transferControls(entity, { vehicle: args.vehicle });

    character.controlledObject = args.vehicle;
    character.controlledObject.allowSleep(false);
    // args.vehicle.inputReceiverInit();

    args.vehicle.controllingCharacter = character as any;
    // }
};
// TODO: Replace  me, this icontrollable is not the same...

export const transferControls: Behavior = (entity: Entity): void => {

    console.log("Transfer me!");

};

export const stopControllingVehicle: Behavior = (entity: Entity): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    if (character.controlledObject?.controllingCharacter == character) {
        character.controlledObject.allowSleep(true);
        character.controlledObject.controllingCharacter = undefined;
        character.controlledObject.resetControls();
        character.controlledObject = undefined;
        // inputReceiverInit(entity);
    }
};

export const exitVehicle: Behavior = (entity: Entity): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    // if (character.occupyingSeat !== null) {
    //     if (character.occupyingSeat.vehicle.entityType === EntityType.Airplane) {
    //         setState(entity, { state: new ExitingAirplane(character, character.occupyingSeat) });
    //     }
    //     else {
    //         setState(entity, { state: new ExitingVehicle(character, character.occupyingSeat) });
    //     }

    //     stopControllingVehicle(entity);
    // }
};

export const occupySeat: Behavior = (entity, args: { seat: VehicleSeat; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    character.occupyingSeat = args.seat;
    args.seat.occupiedBy = character;
};

export const leaveSeat: Behavior = (entity: Entity): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    if (character.occupyingSeat !== null) {
        character.occupyingSeat.occupiedBy = null;
        character.occupyingSeat = null;
    }
};
