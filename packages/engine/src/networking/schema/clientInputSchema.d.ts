/// <reference types="node" />
import { Model, Schema } from "superbuffer";
import { NetworkClientInputInterface } from "../interfaces/WorldState";
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
    snapShotTime: import("superbuffer").BufferView<number>;
}>;
/** Class for client input. */
export declare class ClientInputModel {
    /** Model holding client input. */
    static model: Model;
    /** Convert to buffer. */
    static toBuffer(inputs: NetworkClientInputInterface): Buffer;
    /** Read from buffer. */
    static fromBuffer(buffer: Buffer): NetworkClientInputInterface;
}
