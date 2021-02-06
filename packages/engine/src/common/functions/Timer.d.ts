declare type TimerUpdateCallback = (delta: number, elapsedTime?: number) => any;
export declare function Timer(callbacks: {
    update?: TimerUpdateCallback;
    fixedUpdate?: TimerUpdateCallback;
    networkUpdate?: TimerUpdateCallback;
    render?: Function;
}, fixedFrameRate?: number, networkTickRate?: number): {
    start: Function;
    stop: Function;
};
export declare class FixedStepsRunner {
    timestep: number;
    limit: number;
    updatesLimit: number;
    readonly subsequentErrorsLimit = 10;
    readonly subsequentErrorsResetLimit = 1000;
    private subsequentErrorsShown;
    private shownErrorPreviously;
    private accumulator;
    readonly callback: (time: number) => void;
    constructor(updatesPerSecond: number, callback: (time: number) => void);
    canRun(delta: number): boolean;
    run(delta: number): void;
}
export declare function createFixedTimestep(updatesPerSecond: number, callback: (time: number) => void): (delta: number) => void;
export {};
