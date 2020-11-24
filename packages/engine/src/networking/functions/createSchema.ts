import { Network } from "../components/Network";
import { newHash } from "./newHash";
import { MessageSchema } from "../classes/MessageSchema";

export const createSchema = (name: string, _struct: Object) => {
    const id = newHash(name, _struct);
    const s = new MessageSchema(id, name, _struct);
    Network._schemas.set(id, s);
    return s;
};
