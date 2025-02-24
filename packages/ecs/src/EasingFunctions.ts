/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

export type EasingFunction = {
  (t: number): number
  path: string
}

interface EasingType {
  in: EasingFunction
  out: EasingFunction
  inOut: EasingFunction
}

class EasingBuilder<P extends string> {
  private constructor(
    private fn: (t: number) => number,
    private path: P,
    private isFinal: boolean = false
  ) {}

  static create<P extends string>(fn: (t: number) => number, path: P): EasingType {
    const builder = new EasingBuilder(fn, path)
    return {
      in: builder.createIn(),
      out: builder.createOut(),
      inOut: builder.createInOut()
    }
  }

  private createIn(): EasingFunction {
    const fn = (t: number) => this.fn(t)
    return Object.assign(fn, { path: `${this.path}.in` })
  }

  private createOut(): EasingFunction {
    const fn = (t: number) => 1 - this.fn(1 - t)
    return Object.assign(fn, { path: `${this.path}.out` })
  }

  private createInOut(): EasingFunction {
    const fn = (t: number) => (t < 0.5 ? this.fn(t * 2) / 2 : 1 - this.fn((1 - t) * 2) / 2)
    return Object.assign(fn, { path: `${this.path}.inOut` })
  }
}

export const Easing = {
  linear: EasingBuilder.create((t) => t, 'linear'),
  quadratic: EasingBuilder.create((t) => t * t, 'quadratic'),
  cubic: EasingBuilder.create((t) => t * t * t, 'cubic'),
  quartic: EasingBuilder.create((t) => t * t * t * t, 'quartic'),
  quintic: EasingBuilder.create((t) => t * t * t * t * t, 'quintic'),
  sine: EasingBuilder.create((t) => 1 - Math.cos((t * Math.PI) / 2), 'sine'),
  exponential: EasingBuilder.create((t) => Math.pow(2, 10 * (t - 1)), 'exponential'),
  circle: EasingBuilder.create((t) => 1 - Math.sqrt(1 - t * t), 'circle'),
  back: EasingBuilder.create((t) => {
    const s = 1.70158
    return t * t * ((s + 1) * t - s)
  }, 'back'),
  elastic: EasingBuilder.create((t) => 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * Math.PI), 'elastic'),
  bounce: EasingBuilder.create((t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) {
      const t2 = t - 1.5 / 2.75
      return 7.5625 * t2 * t2 + 0.75
    }
    if (t < 2.5 / 2.75) {
      const t2 = t - 2.25 / 2.75
      return 7.5625 * t2 * t2 + 0.9375
    }
    const t2 = t - 2.625 / 2.75
    return 7.5625 * t2 * t2 + 0.984375
  }, 'bounce'),
  fromPath: <P extends string>(path: P): EasingFunction => {
    const [name, mode] = path.split('.')
    const easing = Easing[name as keyof typeof Easing]
    if (!easing) {
      throw new Error(`Invalid easing function path: ${path}`)
    }
    return easing[mode as keyof EasingType]
  }
} as const

// export all of the easing function paths as a strongly typed string array
export const EasingFunctionPaths = Object.values(Easing).reduce<string[]>((acc, easing) => {
  if (typeof easing === 'object') {
    acc.push(easing.in.path, easing.out.path, easing.inOut.path)
  }
  return acc
}, [])

// Usage examples:
// const linear = Easing.linear
// const easeInQuad = Easing.quadratic.in
// const easeInOutSine = Easing.sine.inOut
// const fromPath = Easing.fromPath("quadratic.inOut")
