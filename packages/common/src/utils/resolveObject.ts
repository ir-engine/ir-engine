import type { Function, Object, String } from 'ts-toolbelt'

export function resolveObject<O extends object, P extends string>(
  obj: O,
  path: Function.AutoPath<O, P>
): Object.Path<O, String.Split<P, '.'>> {
  const keyPath = Array.isArray(path) ? path : path.split('.')
  return keyPath.reduce((prev, curr) => prev?.[curr], obj as any)
}
