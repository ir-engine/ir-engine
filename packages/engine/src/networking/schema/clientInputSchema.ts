import { uint8, float32, uint16 } from "../../common/types/DataTypes";
import { createSchema } from "../functions/createSchema";
import { Model } from "../classes/Model";

const inputKeySchema = createSchema('button', {
  input: uint8,
  value: uint8,
  lifecycleValue: uint8
});

const inputAxis1DSchema = createSchema('axis1d', {
  input: uint8,
  value: float32,
  lifecycleValue: uint8
});

const inputAxis2DSchema = createSchema('axis2d', {
  input: uint8,
  valueX: float32,
  valueY: float32,
  lifecycleValue: uint8
});

const inputKeyArraySchema = createSchema('main', {
  networkId: uint16,
  buttons: [inputKeySchema],
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema]
});

export const clientInputModel = new Model(inputKeyArraySchema);
