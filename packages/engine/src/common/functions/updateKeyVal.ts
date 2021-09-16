interface UpdateMediatorFunction<Val, UpdateArgs extends any[]> {
  (value: Val, ...extraArgs: UpdateArgs): Val
}
interface UpdateFunction<Key, Val, UpdateArgs extends any[]> {
  (key: Key, ...extraArgs: UpdateArgs): Val
}
export default function updateKeyVal<Key, Val, UpdateArgs extends any[]>(
  get: (key: Key) => Val,
  set: (key: Key, val: Val) => Val,
  updateFn: UpdateMediatorFunction<Val, UpdateArgs>,
  defaultValue: Val
): UpdateFunction<Key, Val, UpdateArgs> {
  return (key: Key, ...extraArgs: UpdateArgs) => {
    const val = updateFn(get(key) || defaultValue, ...extraArgs)
    set(key, val)
    return val
  }
}
