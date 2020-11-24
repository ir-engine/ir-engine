export function constructInstance<T> (type: new () => T): T {
  return new type();
}
