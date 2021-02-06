/**
 * Ring buffer holds data in circular form.\
 * Data will be inserted in linear fashion and when the buffer reaches its maximum size then
 * newly entered data will be overwrite first element(s).
 *
 * ```
 * // Below will create ring buffer with 4 elements and sets size of the buffer to 4.
 * const buffer = RingBuffer.fromArray([1, 2, 3, 4]);
 *
 * // Adding new elements will overweight element(s) in FIFO manner.
 * buffer.add(5, 6); // now buffer contains [5, 6, 3, 4]
 * ```
 *
 * @typeparam T Type of the data.
 */
export declare class RingBuffer<T> {
    /**
     * Create ring buffer from array.
     * @param data Array of element(s).
     * @param size Size of ring array.
     */
    static fromArray<T>(data: T[], size?: number): RingBuffer<T>;
    /** Buffer to hold element(s). */
    private buffer;
    /** Maximum number of elements this buffer can contain. */
    private size;
    /** Current position on the ring buffer. */
    private pos;
    /**
     * Create new ring buffer and copy elements from this ring buffer.
     *
     * @returns Newly created ring buffer.
     */
    copy(): RingBuffer<T>;
    /**
    * Create new ring buffer and copy elements from this ring buffer.
    *
    * @returns Newly created ring buffer.
    */
    clone(): RingBuffer<T>;
    /** Constructs ring buffer of given size */
    constructor(size: number);
    /** @returns size of the ring buffer. */
    getSize(): number;
    /** @returns current position on the ring buffer. */
    getPos(): number;
    /** @returns count of elements in the ring buffer. */
    getBufferLength(): number;
    /**
     * Add element(s) into the ring buffer.\
     * If overflow happens then element(s) will be overwritten by FIFO manner.
     * @param items list of element(s) to be inserted.
     */
    add(...items: T[]): void;
    /**
     * Get element at given index from ring buffer.
     * @param index Index of the element which will be retrieved.
     * @returns Element in the given index or undefined if not found.
     */
    get(index: number): T | undefined;
    /**
     * Get first element from the ring buffer.
     * @returns First element of ring buffer.
     */
    getFirst(): T | undefined;
    /**
     * Get last element from the ring buffer.
     * @returns Last element of ring buffer.
     */
    getLast(): T | undefined;
    /**
     * Remove element(s) from the ring buffer.
     * @param index Index From which element(s) will be removed.
     * @param count Number of element(s) to be removed.
     * @returns Array of removed element(s).
     */
    remove(index: number, count?: number): T[];
    /** Remove and return element from current position.
     *
     * @returns Removed element from current position.
     */
    pop(): T;
    /** Remove and return last element from ring buffer.
     *
     * @returns last element from ring buffer.
     */
    popLast(): T;
    /**
     * Generates array from ring buffer.
     *
     * @returns generated array containing ring buffer elements.
     */
    toArray(): T[];
    /**
     * Fill up the ring buffer with array elements.\
     * If array contains more element than size of ring buffer then excess elements will not be included in array.
     * To include every elements set **```resize```** to **```true```**.
     * @param data Array containing elements.
     * @param resize Whether resize current ring buffer.
     */
    fromArray(data: T[], resize?: boolean): void;
    /** Clear the ring buffer. */
    clear(): void;
    /**
     * Resize ring buffer with given size.
     * @param newSize new size of the buffer.
     */
    resize(newSize: number): void;
    /** @returns Whether the buffer is full or not. */
    full(): boolean;
    /** @returns Whether the buffer is empty or not. */
    empty(): boolean;
}
