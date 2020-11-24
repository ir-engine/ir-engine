export class MessageSchema {
  private _bytes = 0

  constructor(private _id: string, private _name: string, private _struct: Object) {
    this.calcBytes();
  }

  public get id() {
    return this._id;
  }

  public get name() {
    return this._name;
  }

  private calcBytes() {
    const iterate = (obj: any) => {
      for (const property in obj) {
        const type = obj?.type || obj?.type?.type;
        const bytes = obj._bytes || obj.type?._bytes;

        if (!type && obj.hasOwnProperty(property)) {
          if (typeof obj[property] === 'object') {
            iterate(obj[property]);
          }
        } else {
          if (property !== 'type') return;
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

  public get struct() {
    return this._struct;
  }

  public get bytes() {
    return this._bytes;
  }
}