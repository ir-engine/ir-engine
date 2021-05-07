import { isClient } from "../../common/functions/isClient";

type StorageDatatypes = string | object | boolean | number;

export class ClientStorage {

  private static _db = (async () => {
    if (!isClient) return new Map;
    return (await import('immortal-db')).ImmortalDB;
  })()

  static async get(key: string | number): Promise<StorageDatatypes> {
    const db = await this._db;
    const value = db.get(String(key));
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  static async set(key: string | number, value: StorageDatatypes): Promise<void> {
    const db = await this._db;
    if(typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    await db.set(String(key), value);
  }
  static async remove(key: string | number): Promise<void> {
    const db = await this._db;
    const sKey = String(key)
    await (db instanceof Map ? db.delete(sKey) : db.remove(sKey))
  }
}