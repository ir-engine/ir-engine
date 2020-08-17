export declare class Entity {
    id: number;
    componentTypes: any[];
    components: {};
    componentsToRemove: {};
    queries: any[];
    componentTypesToRemove: any[];
    alive: boolean;
    numStateComponents: number;
    name: any;
    constructor();
    copy(src: any): Entity;
    clone(): Entity;
    reset(): void;
    remove(forceImmediate?: boolean): void;
}
