export * from "./common";
export * from "./input";
export * from "./state";
import { Entity, World } from "ecsy";
import InputSchema from "./input/interfaces/InputSchema";
import StateSchema from "./state/interfaces/StateSchema";
import NetworkTransportAlias from "./networking/types/NetworkTransportAlias";
export declare function initializeInputSystems(world: World, options?: {
    debug: boolean;
}): World | null;
export declare function initializeActor(entity: Entity, options: {
    inputMap?: InputSchema;
    stateMap?: StateSchema;
}): Entity;
export declare function initializeNetworking(world: World, transport?: NetworkTransportAlias): void;
