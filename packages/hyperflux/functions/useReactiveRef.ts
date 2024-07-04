//https://stackoverflow.com/a/60476525

import { useCallback } from 'react'
import { useHookstate } from './StateFunctions'

export const useReactiveRef = <T extends HTMLElement>() => {
  const ref = useHookstate({ current: null })
  const handleRef = useCallback((node) => {
    ref.current.set(node)
  }, [])
  return [ref.value as { current: T | null }, handleRef] as const
}
