import React, { useEffect } from 'react'

import '@hookstate/core'

// TODO: remove all this on next hookstate/core release,
// as there is a bug w/ the built-in useHookEffect implementation

let originUseEffect: (effect: React.EffectCallback, deps?: React.DependencyList) => void

export const useHookEffect = (value: React.EffectCallback, deps?: React.DependencyList) => {
  const updatedDeps = deps?.map((dep) => {
    if (typeof dep === 'object' && dep && typeof dep.value !== 'object') return dep.value
    return dep
  })
  useEffect(value, updatedDeps)
}

export function interceptUseEffect() {
  if (!originUseEffect) {
    originUseEffect = React['useEffect']
    React['useEffect'] = useHookEffect
  }
}
