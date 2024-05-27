import { DependencyList, EffectCallback, useLayoutEffect, useRef } from 'react'

function depsDiff(deps1, deps2) {
  return !(
    Array.isArray(deps1) &&
    Array.isArray(deps2) &&
    deps1.length === deps2.length &&
    deps1.every((dep, idx) => Object.is(dep, deps2[idx]))
  )
}

export function useImmediateEffect(effect: EffectCallback, deps?: DependencyList) {
  const cleanupRef = useRef<any>()
  const depsRef = useRef<any>()

  if (!depsRef.current || depsDiff(depsRef.current, deps)) {
    depsRef.current = deps

    if (cleanupRef.current) {
      cleanupRef.current()
    }

    cleanupRef.current = effect()
  }

  useLayoutEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}
