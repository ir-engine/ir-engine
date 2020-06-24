import { Component, Types } from "ecsy";
interface Schema {
    value: {
        default: false;
        type: Types["Boolean"];
    };
}
export declare class Draggable extends Component {
    schema: Schema;
}
export {};
