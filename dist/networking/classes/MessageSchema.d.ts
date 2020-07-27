import MessageTypeAlias from "../types/MessageTypeAlias";
export default class MessageSchema<T> {
    private _messageType;
    private _struct;
    private _bytes;
    constructor(_messageType: MessageTypeAlias, _struct: T);
    get messageType(): MessageTypeAlias;
    private calcBytes;
    get struct(): unknown;
    get bytes(): number;
}
