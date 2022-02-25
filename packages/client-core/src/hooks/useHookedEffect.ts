import { StateMethods } from '@speigg/hookstate'
import { useEffect } from 'react'

type PrimitiveType = string | number | boolean | null | undefined

export const useHookedEffect = (value: () => void, deps: Array<StateMethods<any> | PrimitiveType>) => {
  useEffect(value, deps)
  for (const d of deps) {
    if (d && typeof d === 'object') d?.value // notify hookstate that this value is used
  }
}
