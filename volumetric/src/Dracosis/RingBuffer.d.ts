export default class RingBuffer<T> {
    private _newInputBuffer;
    static fromArray<T>(data: T[], size?: number): RingBuffer<T>;
    private values;
    private size;
    private pos;
    constructor(size: number);
    getSize(): number;
    getPos(): number;
    getBufferLength(): number;
    add(...items: T[]): void;
    get(index: number): T | undefined;
    getFirst(): T | undefined;
    getLast(): T | undefined;
    remove(index: number, count?: number): T[];
    pop(): T;
    popLast(): T;
    toArray(): T[];
    fromArray(data: T[], resize?: boolean): void;
    clear(): void;
    resize(newSize: number): void;
    full(): boolean;
    empty(): boolean;
}
