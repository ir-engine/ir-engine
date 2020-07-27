import { Schema } from "./Schema"
import { Serialize } from "./Serialize"

export class Model extends Serialize {
  constructor(protected schema: Schema) {
    super(schema)
  }
}
