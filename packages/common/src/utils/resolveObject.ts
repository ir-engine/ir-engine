/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
