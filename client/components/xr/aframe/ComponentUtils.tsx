import { kebabCase } from 'lodash'

export default function PropertyMapper (props, ComponentName): any {
  return props.reduce((o, propName) => ({ ...o, [kebabCase(propName)]: ComponentName.concat('.').concat(propName) }), {})
}
