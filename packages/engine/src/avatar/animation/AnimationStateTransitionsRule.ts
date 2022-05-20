import { AnimationAction, Vector3 } from 'three'

export type AnimationStateTransitionRule = {
  type: string
}

export type BooleanTransitionRule = AnimationStateTransitionRule & {
  object: object
  property: string
  negate: boolean
}

export type AnimationTimeTransitionRule = AnimationStateTransitionRule & {
  action: AnimationAction
  threshold: number
}

export type VectorLengthTransitionRule = AnimationStateTransitionRule & {
  value: Vector3
  threshold: number
}

export type CompositeTransitionRule = AnimationStateTransitionRule & {
  rules: AnimationStateTransitionRule[]
  operator: 'and' | 'or'
}

const ruleHandlers = {
  BooleanTransitionRule: booleanTransitionRule,
  AnimationTimeTransitionRule: animationTimeTransitionRule,
  VectorLengthTransitionRule: vectorLengthTransitionRule,
  CompositeTransitionRule: compositeTransitionRule
}

export function canEnterTransition(rule: AnimationStateTransitionRule): boolean {
  const handler = ruleHandlers[rule.type]
  if (typeof handler === 'function') return handler(rule)
  return false
}

export function booleanTransitionRule(rule: BooleanTransitionRule): boolean {
  const value = rule.object[rule.property]
  return rule.negate ? !value : value
}

export function animationTimeTransitionRule(rule: AnimationTimeTransitionRule): boolean {
  const ratio = rule.action.time / rule.action.getClip().duration
  return ratio > rule.threshold
}

export function vectorLengthTransitionRule(rule: VectorLengthTransitionRule): boolean {
  return rule.value.lengthSq() >= rule.threshold
}

export function compositeTransitionRule(rule: CompositeTransitionRule): boolean {
  let result = false

  for (const rle of rule.rules) {
    result = canEnterTransition(rle)

    if (rule.operator === 'and') {
      if (!result) break
    } else if (result) {
      break
    }
  }

  return result
}
