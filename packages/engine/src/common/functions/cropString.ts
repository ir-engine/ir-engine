export function cropString (str: string, length: number): string {
  return str.padEnd(length, ' ').slice(0, length);
}
