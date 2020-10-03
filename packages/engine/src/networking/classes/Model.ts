import { Serialize } from './Serialize';
import { MessageSchema } from './MessageSchema';

export class Model extends Serialize {
  constructor(protected schema: MessageSchema) {
    super(schema);
  }
}