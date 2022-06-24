import { Object3D } from 'three'

export default function iterateObject3D<T extends Object3D, R>(
  root: Object3D,
  callback: (child: T) => R,
  predicate: (child: T) => boolean = (_) => true,
  snubChildren: boolean = false,
  breakOnFind: boolean = false
): R[] {
  const result: R[] = []
  const frontier: Object3D[][] = [[root]]
  do {
    const entry = frontier.pop()!
    for (const obj3d of entry) {
      if (predicate(obj3d as T)) {
        result.push(callback(obj3d as T))
        if (breakOnFind) break
        if (snubChildren) frontier.push(obj3d.children ?? [])
      }
      if (!snubChildren) frontier.push(obj3d.children ?? [])
    }
  } while (frontier.length > 0)
  return result
}
