export type Paths<S extends unknown> = S extends object
  ? {
      [K in keyof S]: K extends string ? [K, ...Paths<S[K]>] : never
    }[keyof S]
  : []

// type x = Paths<{a: {b: {c: number, d:number}}}> // ['a', 'b', 'c'] | ['a', 'b', 'd']

export type StringPaths<S extends unknown> = S extends object
  ? {
      [K in keyof S]: K extends string
        ? `${K}${S[K] extends object ? '.' : ''}${S[K] extends object ? StringPaths<S[K]> : ''}`
        : never
    }[keyof S]
  : ''

// type x = StringPaths<{a: {b: {c: number, d:number}}}> // 'a.b.c' | 'a.b.d'

export type ValueAtPath<S extends unknown, P extends Paths<S>> = P extends [infer K, ...infer R]
  ? K extends keyof S
    ? R extends Paths<S[K]>
      ? ValueAtPath<S[K], R>
      : never
    : never
  : S

// type x = ValueAtPath<{a: {b: {c: number}}}, ['a', 'b', 'c']>

export type ValueFromStringPath<S extends unknown, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof S
    ? ValueFromStringPath<S[K], R>
    : never
  : S

// type x = ValueFromStringPath<{a: {b: {c: number}}}, 'a.b.c'>

export function resolveObject<S extends unknown, P extends Paths<S>>(obj: S, path: P): ValueAtPath<S, P>
export function resolveObject<S extends unknown, P extends StringPaths<S>>(obj: S, path: P): ValueFromStringPath<S, P>
export function resolveObject(obj, path) {
  const keyPath = Array.isArray(path) ? path : path.split('.')
  return keyPath.reduce((prev, curr) => prev?.[curr], obj)
}
