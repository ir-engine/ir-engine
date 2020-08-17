import { MessageSchema } from "../classes/MessageSchema";
export declare function toBuffer(input: MessageSchema<any>): ArrayBuffer;
export declare function fromBuffer(buffer: ArrayBuffer): any;
export declare const populateData: (data: any, obj: any, key: any, value: any, path?: string, isArray?: boolean) => void;
export declare function flattenSchema(schema: MessageSchema<any>, data: any): any[];
