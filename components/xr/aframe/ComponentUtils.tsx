export default function PropertyMapper (props, ComponentName) {
  return props.reduce((o, propName) => ({ ...o, [propName]: ComponentName + '.' + propName }), {})
}
