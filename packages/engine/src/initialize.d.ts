export declare const DefaultInitializationOptions: {
    debug: boolean;
    withTransform: boolean;
    withWebXRInput: boolean;
    input: {
        enabled: boolean;
        schema: import("./input/interfaces/InputSchema").InputSchema;
    };
    networking: {
        enabled: boolean;
        supportsMediaStreams: boolean;
        schema: import("./networking/interfaces/NetworkSchema").NetworkSchema;
    };
    state: {
        enabled: boolean;
        schema: import("./state/interfaces/StateSchema").StateSchema;
    };
    subscriptions: {
        enabled: boolean;
        schema: import("./subscription/interfaces/SubscriptionSchema").SubscriptionSchema;
    };
    physics: {
        enabled: boolean;
    };
    particles: {
        enabled: boolean;
    };
    camera: {
        enabled: boolean;
    };
    transform: {
        enabled: boolean;
    };
    renderer: {
        enabled: boolean;
    };
};
export declare function initialize(options?: any): void;
export declare function startTimerForClient(): void;
export declare function startTimerForServer(): void;
