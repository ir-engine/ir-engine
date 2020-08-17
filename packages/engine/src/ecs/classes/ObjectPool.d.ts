export declare class ObjectPool<T> {
    freeList: any[];
    count: number;
    isObjectPool: boolean;
    type: {
        new (...args: any[]): T;
    };
    constructor(baseObject: any, initialSize?: number);
    acquire(): T;
    release(item: T): void;
    expand(count: number): void;
    totalSize(): number;
    totalFree(): number;
    totalUsed(): number;
}
