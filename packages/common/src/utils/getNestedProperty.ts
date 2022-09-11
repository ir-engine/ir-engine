export function getNestedObject(object: any, propertyName: string): { result: any; finalProp: string } {
  const props = propertyName.split('.')
  let result = object

  for (let i = 0; i < props.length - 1; i++) {
    if (typeof result[props[i]] === 'undefined') result[props[i]] = {}
    result = result[props[i]]
  }

  return { result, finalProp: props[props.length - 1] }
}
