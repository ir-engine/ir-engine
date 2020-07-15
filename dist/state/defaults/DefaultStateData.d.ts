import StateMap from "../interfaces/StateMap";
export declare const DefaultStateTypes: {
    IDLE: number;
    MOVING: number;
    JUMPING: number;
    FALLING: number;
    CROUCHING: number;
    WALKING: number;
    SPRINTING: number;
    INTERACTING: number;
    MOVING_FORWARD: number;
    MOVING_BACKWARD: number;
    MOVING_LEFT: number;
    MOVING_RIGHT: number;
};
export declare const DefaultStateGroups: {
    MOVEMENT: number;
    MOVEMENT_MODIFIERS: number;
};
export declare const DefaultStateMap: StateMap;
