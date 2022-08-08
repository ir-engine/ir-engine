/**
 * Capitalizes first letter of a string.
 * Replacement for `_.upperFirst()`
 * @param string
 */
export default function capitalizeFirstLetter(string?: string): string {
  if (!string) {
    return ''
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}
