export function longToByteArray(/*long*/long: number) {
    // we want to represent the input as a 8-bytes array
    let byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let index = 0; index < byteArray.length; index++) {
        const byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
    }
    return byteArray;
};

export function byteArrayToLong(/*byte[]*/byteArray: Buffer) {
    let value = 0;
    for (let i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }
    return value;
};

export function padFrameNumberWithZeros(n: any, width: number) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

export function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t
}
