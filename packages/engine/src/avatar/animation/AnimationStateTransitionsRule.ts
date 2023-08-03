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

import { AnimationAction, Vector2, Vector3 } from 'three'

export type AnimationStateTransitionRule = () => boolean

export function booleanTransitionRule(object: any, property: string, negate = false): AnimationStateTransitionRule {
  if (negate) return () => !object[property]
  return () => object[property]
}

export function animationTimeTransitionRule(
  action: AnimationAction,
  threshold: number,
  lowerThan = false
): AnimationStateTransitionRule {
  if (lowerThan) return () => action.time / action.getClip().duration <= threshold
  return () => action.time / action.getClip().duration >= threshold
}

export function vectorLengthTransitionRule(
  value: Vector3 | Vector2,
  threshold: number,
  lowerThan = false,
  exact = false
): AnimationStateTransitionRule {
  if (exact) {
    if (lowerThan) return () => value.length() <= threshold
    return () => value.length() >= threshold
  }

  if (lowerThan) return () => value.lengthSq() <= threshold
  return () => value.lengthSq() >= threshold
}

export function compositeTransitionRule(
  rules: AnimationStateTransitionRule[],
  operator: 'and' | 'or'
): AnimationStateTransitionRule {
  if (operator === 'and')
    return () => {
      let result = false
      for (const rle of rules) {
        result = rle()
        if (!result) break
      }
      return result
    }

  return () => {
    let result = false
    for (const rle of rules) {
      result = rle()
      if (result) break
    }
    return result
  }
}

// Allows state transition based on an object's numerical property
export function thresholdTransitionRule(
  object: object,
  property: string,
  threshold = 0,
  largerThan = false
): AnimationStateTransitionRule {
  if (largerThan) return () => object[property] > threshold
  return () => object[property] < threshold
}
