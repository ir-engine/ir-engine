import { AnimationAction, Vector2, Vector3 } from 'three'

export type AnimationStateTransitionRule = () => boolean

export function booleanTransitionRule(
  object: any,
  property: string,
  negate: boolean = false
): AnimationStateTransitionRule {
  if (negate) return () => !object[property]
  return () => object[property]
}

export function animationTimeTransitionRule(
  action: AnimationAction,
  threshold: number,
  lowerThan: boolean = false
): AnimationStateTransitionRule {
  if (lowerThan) return () => action.time / action.getClip().duration <= threshold
  return () => action.time / action.getClip().duration >= threshold
}

export function vectorLengthTransitionRule(
  value: Vector3 | Vector2,
  threshold: number,
  lowerThan: boolean = false,
  exact: boolean = false
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
  threshold: number = 0,
  largerThan: boolean = false
): AnimationStateTransitionRule {
  if (largerThan) return () => object[property] > threshold
  return () => object[property] < threshold
}
