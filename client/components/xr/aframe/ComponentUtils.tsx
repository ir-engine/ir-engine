import { kebabCase } from 'lodash'

export default function PropertyMapper (props, ComponentName) {
  return props.reduce((o, propName) => ({ ...o, [kebabCase(propName)]: ComponentName + '.' + propName }), {})
}
