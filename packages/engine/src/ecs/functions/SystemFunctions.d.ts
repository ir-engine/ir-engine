import { System, SystemConstructor } from "../classes/System";
export declare function registerSystem(SystemClass: SystemConstructor<any>, attributes?: object): void;
export declare function unregisterSystem(SystemClass: SystemConstructor<any>): void;
export declare function getSystem<S extends System>(SystemClass: SystemConstructor<S>): S;
export declare function getSystems(): Array<System>;
export declare function removeSystem(SystemClass: any): void;
export declare function executeSystem(system: System, delta: number, time: number): void;
export declare function sortSystems(): void;
