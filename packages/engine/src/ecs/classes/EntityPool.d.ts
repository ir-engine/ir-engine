import { Entity } from "./Entity";
import { ObjectPool } from "./ObjectPool";
export declare class EntityPool extends ObjectPool<Entity> {
    type: any;
    freeList: any;
    count: any;
    constructor();
    expand(count: any): void;
}
