export function instanceOf<T> (object: any): object is T {
  return 'member' in object;
}
