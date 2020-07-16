import { Entity, World } from "ecsy";
import InputMap from "./input/interfaces/InputMap";
export declare function initializeInputSystems(world: World, options?: {
    debug: boolean;
}, inputMap?: InputMap): World | null;
export declare function addInputHandlingToEntity(entity: Entity): Entity;
