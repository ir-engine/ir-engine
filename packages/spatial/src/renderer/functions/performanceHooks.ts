import { State, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { PerformanceState } from '../PerformanceState'

export const usePerformanceTier = (): State<number> => {
  const performanceState = useMutableState(PerformanceState)
  const performanceTier = useHookstate(performanceState.tier.value)

  useEffect(() => {
    performanceTier.set(performanceState.tier.value)
  }, [performanceState.tier])

  return performanceTier
}

export const usePerformanceOffset = (): State<number> => {
  const performanceState = useMutableState(PerformanceState)
  const performanceOffset = useHookstate(performanceState.performanceOffset.value)

  useEffect(() => {
    performanceOffset.set(performanceState.performanceOffset.value)
  }, [performanceState.performanceOffset])

  return performanceOffset
}
