import { BufferAttribute, InterleavedBufferAttribute } from "three";
export default class ClonableInterleavedBufferAttribute extends InterleavedBufferAttribute {
    clone(): BufferAttribute;
}
