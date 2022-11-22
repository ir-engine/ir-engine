import { State, useHookstate } from '@hookstate/core'
import { useEffect, useState } from 'react'

export const useHookstateFromFactory = <T>(cb: (...any) => T): State<T> => {
  const state = useHookstate({} as T)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (mounted) return
    state.set(cb())
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])
  return state
}
