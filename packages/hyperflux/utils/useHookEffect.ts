import { StateMethods } from '@hookstate/core'
import { useEffect } from 'react'

type PrimitiveType = string | number | boolean | null | undefined

export const useHookEffect = (value: () => void, deps: Array<StateMethods<any> | PrimitiveType>) => {
  const updatedDeps = deps.map((dep) => {
    if (typeof dep === 'object' && dep && typeof dep.value !== 'object') return dep.value
    return dep
  })
  useEffect(value, updatedDeps)
}
