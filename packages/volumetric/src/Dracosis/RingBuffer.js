export default class RingBuffer {
    constructor(size) {
        this.values = [];
        this.pos = 0;
        console.log("Constructing ring buffer");
        if (size < 0) {
            throw new RangeError("The size does not allow negative values.");
        }
        this.size = size;
    }
    static fromArray(data, size = 0) {
        const actionBuffer = new RingBuffer(size);
        actionBuffer.fromArray(data, size === 0);
        return actionBuffer;
    }
    getSize() {
        return this.size;
    }
    getPos() {
        return this.pos;
    }
    getBufferLength() {
        return this.values.length;
    }
    add(...items) {
        items.forEach(item => {
            this.values[this.pos] = item;
            this.pos = (this.pos + 1) % this.size;
        });
    }
    get(index) {
        if (index < 0) {
            index += this.values.length;
        }
        if (index < 0 || index > this.values.length) {
            return undefined;
        }
        if (this.values.length < this.size) {
            return this.values[index];
        }
        return this.values[(this.pos + index) % this.size];
    }
    getFirst() {
        return this.get(0);
    }
    getLast() {
        return this.get(-1);
    }
    remove(index, count = 1) {
        if (index < 0) {
            index += this.values.length;
        }
        if (index < 0 || index > this.values.length) {
            return [];
        }
        const arr = this.toArray();
        const removedItems = arr.splice(index, count);
        this.fromArray(arr);
        return removedItems;
    }
    pop() {
        return this.remove(0)[0];
    }
    popLast() {
        return this.remove(-1)[0];
    }
    toArray() {
        return this.values.slice(this.pos).concat(this.values.slice(0, this.pos));
    }
    fromArray(data, resize = false) {
        if (!Array.isArray(data)) {
            throw new TypeError("Input value is not an array.");
        }
        if (resize)
            this.resize(data.length);
        if (this.size === 0)
            return;
        this.values = data.slice(-this.size);
        this.pos = this.values.length % this.size;
    }
    clear() {
        this.values = [];
        this.pos = 0;
    }
    resize(newSize) {
        if (newSize < 0) {
            throw new RangeError("The size does not allow negative values.");
        }
        if (newSize === 0) {
            this.clear();
        }
        else if (newSize !== this.size) {
            const currentBuffer = this.toArray();
            this.fromArray(currentBuffer.slice(-newSize));
            this.pos = this.values.length % newSize;
        }
        this.size = newSize;
    }
    full() {
        return this.values.length === this.size;
    }
    empty() {
        return this.values.length === 0;
    }
}
