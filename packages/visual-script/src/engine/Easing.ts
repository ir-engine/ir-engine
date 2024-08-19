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

export type Easing = (t: number) => number

export const EasingFunctions: { [name: string]: Easing } = {
  linear: (t) => t,
  quadratic: (t) => t * t,
  cubic: (t) => t * t * t,
  quartric: (t) => t * t * t * t,
  quintic: (t) => t * t * t * t * t,
  sine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  exponential: (t) => Math.pow(2, 10 * (t - 1)),
  circle: (t) => 1 - Math.sqrt(1 - t * t),
  back: (t) => {
    const s = 1.70158
    return t * t * ((s + 1) * t - s)
  },
  elastic: (t) => 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * Math.PI),
  bounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    }
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
  }
}

export const EasingModes: { [name: string]: (easing: Easing) => Easing } = {
  in: (easing: Easing) => {
    return easing
  },
  out: (easing: Easing) => {
    return (t) => 1 - easing(1 - t)
  },
  inOut: (easing: Easing) => {
    return (t) => {
      if (t < 0.5) {
        return easing(t * 2) / 2
      }
      return 1 - easing((1 - t) * 2) / 2
    }
  }
}
