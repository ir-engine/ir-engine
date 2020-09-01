import { uint8 } from "../../common/types/DataTypes";
import { createSchema } from "../functions/createSchema";
import { Model } from "../classes/Model";
const inputKeySchema = createSchema('key', {
  key: uint8
});
const inputKeyArraySchema = createSchema('main', {
  keys: [inputKeySchema]
});

export const clientInputModel = new Model(inputKeyArraySchema);
