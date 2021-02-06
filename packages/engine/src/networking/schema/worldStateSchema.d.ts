import { Model, Schema } from "superbuffer";
import { WorldStateInterface } from "../interfaces/WorldState";
/** Schema for input. */
export declare const inputKeyArraySchema: Schema<{
    networkId: import("superbuffer").BufferView<number>;
    axes1d: [Schema<{
        input: any;
        value: any;
        lifecycleState: any;
    }>];
    axes2d: [Schema<{
        input: any;
        value: any;
        lifecycleState: any;
    }>];
    buttons: [Schema<{
        input: any;
        value: any;
        lifecycleState: any;
    }>];
    viewVector: Schema<{
        x: any;
        y: any;
        z: any;
    }>;
}>;
/** Class for holding world state. */
export declare class WorldStateModel {
    /** Model holding client input. */
    static model: Model;
    /** Convert to buffer. */
    static toBuffer(worldState: WorldStateInterface): ArrayBuffer;
    /** Read from buffer. */
    static fromBuffer(buffer: any): WorldStateInterface;
}
