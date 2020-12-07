import { BufferSchema, Model } from '@geckos.io/typed-array-buffer-schema'
import { uint8, uint32, float32 } from '@geckos.io/typed-array-buffer-schema'
//import { uint8, float32, uint16, uint32 } from "../../common/types/DataTypes";
//import { createSchema } from "../functions/createSchema";
//import { Model } from "../classes/Model";

const inputKeySchema = BufferSchema.schema('button', {
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
});

const inputAxis1DSchema = BufferSchema.schema('axis1d', {
  input: uint8,
  value: float32,
  lifecycleState: uint8
});

const inputAxis2DSchema = BufferSchema.schema('axis2d', {
  input: uint8,
  valueX: float32,
  valueY: float32,
  lifecycleState: uint8
});

const viewVectorSchema = BufferSchema.schema('viewVector', {
  x: float32,
  y: float32,
  z: float32
});


export const inputKeyArraySchema = BufferSchema.schema('inputs', {
  networkId: uint32,
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema],
  buttons: [inputKeySchema],
  viewVector: viewVectorSchema
});

export const clientInputModel = new Model(inputKeyArraySchema);
