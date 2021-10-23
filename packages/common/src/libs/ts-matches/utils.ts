/**
 * Tries and run the stringify, if that fails just return the toString
 * @param x Could be anything, including a recursive object
 */
export function saferStringify(x: unknown): string {
  try {
    return JSON.stringify(x)
  } catch (e) {
    return '' + x
  }
}
