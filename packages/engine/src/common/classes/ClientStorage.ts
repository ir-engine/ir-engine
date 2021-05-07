// import { ImmortalDB } from 'immortal-db'

type StorageDatatypes = string | object | boolean | number;

export class ClientStorage {
  static async get(key: string | number): Promise<StorageDatatypes> {
    const value = await ImmortalDB.get(String(key));
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  static async set(key: string | number, value: StorageDatatypes): Promise<string> {
    if(typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    return await ImmortalDB.set(String(key), value);
  }
  static async remove(key: string | number): Promise<void> {
    return await ImmortalDB.remove(String(key));
  }
}