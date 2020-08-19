import { MessageTypeAlias } from '../types/MessageTypeAlias';

export class MessageSchema<T> {
  private _bytes = 0

  constructor (private readonly _messageType: MessageTypeAlias, private readonly _struct: T) {
    this.calcBytes();
  }

  public get messageType (): MessageTypeAlias {
    return this._messageType;
  }

  private calcBytes () {
    const iterate = (obj: any) => {
      for (const property in obj) {
        const type = obj?._type || obj?.type?._type;
        const bytes = obj._bytes || obj.type?._bytes;

        if (!type) {
          if (typeof obj[property] === 'object') {
            iterate(obj[property]);
          }
        } else {
          if (property !== '_type' && property !== 'type') return;
          if (!bytes) return;

          // we multiply the bytes by the String8 / String16 length.
          if (type === 'String8' || type === 'String16') {
            const length = obj.length || 12;
            this._bytes += bytes * length;
          } else {
            this._bytes += bytes;
          }
        }
      }
    };
    iterate(this._struct);
  }

  public get struct (): unknown {
    return this._struct;
  }

  public get bytes (): number {
    return this._bytes;
  }
}
