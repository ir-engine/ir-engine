export const camelCaseToSpacedString = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2')
}
