export declare const DefaultInitializationOptions: {
    input: {
        schema: import("@xr3ngine/engine/src/input/interfaces/InputSchema").InputSchema;
        useWebXR: boolean;
    };
    networking: {
        schema: import("@xr3ngine/engine/src/networking/interfaces/NetworkSchema").NetworkSchema;
    };
    state: {
        schema: import("@xr3ngine/engine/src/state/interfaces/StateSchema").StateSchema;
    };
};
export declare function initializeEngine(initOptions?: any): void;
