import {Schema, Model, ExtractSchemaObject} from "superbuffer"
import { int16, int32, uint8, uint32, uint64, int64, float32, boolean, string } from "superbuffer"
import { NetworkInputInterface } from "../interfaces/WorldState";
//import { uint8, float32, uint16, uint32 } from "../../common/types/DataTypes";
//import { createSchema } from "../functions/createSchema";
//import { Model } from "../classes/Model";

const inputKeySchema = new Schema({
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
});

const inputAxis1DSchema = new Schema({
  input: uint8,
  value: float32,
  lifecycleState: uint8
});

const inputAxis2DSchema = new Schema({
  input: uint8,
  value: [float32],
  lifecycleState: uint8
});

const viewVectorSchema = new Schema({
  x: float32,
  y: float32,
  z: float32
});


export const inputKeyArraySchema = new Schema({
  networkId: uint32,
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema],
  buttons: [inputKeySchema],
  viewVector: viewVectorSchema
});

export class ClientInputModel {
  static model: Model = new Model(inputKeyArraySchema)
  static toBuffer(objectOrArray: NetworkInputInterface): ArrayBuffer {
    // @ts-ignore
    return this.model.toBuffer(objectOrArray);
  }
  static fromBuffer(buffer:unknown): NetworkInputInterface {
    // @ts-ignore
    return this.model.fromBuffer(buffer);
  }
}
