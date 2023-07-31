/** Euler rotation class. */
export default class Euler {
    constructor(a, b, c, rotationOrder) {
        var _a, _b, _c, _d;
        if (!!a && typeof a === "object") {
            this.x = (_a = a.x) !== null && _a !== void 0 ? _a : 0;
            this.y = (_b = a.y) !== null && _b !== void 0 ? _b : 0;
            this.z = (_c = a.z) !== null && _c !== void 0 ? _c : 0;
            this.rotationOrder = (_d = a.rotationOrder) !== null && _d !== void 0 ? _d : "XYZ";
            return;
        }
        this.x = a !== null && a !== void 0 ? a : 0;
        this.y = b !== null && b !== void 0 ? b : 0;
        this.z = c !== null && c !== void 0 ? c : 0;
        this.rotationOrder = rotationOrder !== null && rotationOrder !== void 0 ? rotationOrder : "XYZ";
    }
    /**
     * Multiplies a number to an Euler.
     * @param {number} a: Number to multiply
     */
    multiply(v) {
        return new Euler(this.x * v, this.y * v, this.z * v, this.rotationOrder);
    }
}
