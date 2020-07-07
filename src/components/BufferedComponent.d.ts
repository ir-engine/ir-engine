import { Component } from "ecsy";
import RingBuffer from "../classes/RingBuffer";
export default class BufferedComponent<Props, T> extends Component<Props> {
    bufferSize: number;
    values: RingBuffer<T>;
    constructor(props: Props);
    setBufferSize(newSize: number, resetBuffer?: boolean): void;
    copy(src: this): this;
    reset(): void;
}
