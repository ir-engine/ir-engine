/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import { DependencyList, EffectCallback, useEffect, useLayoutEffect } from 'react'
import { NO_PROXY_STEALTH } from '../functions/StateFunctions'

function depsDiff(deps1, deps2) {
  return !(
    Array.isArray(deps1) &&
    Array.isArray(deps2) &&
    deps1.length === deps2.length &&
    deps1.every((dep, idx) => Object.is(dep, deps2[idx]))
  )
}

function noop() {}

/**
 * Run an effect immediately on mount and whenever deps change.
 *
 * NOTE: this effect only runs after the component is first mounted
 *
 * @param effect
 * @param deps
 */
export function useImmediateEffect(effect: EffectCallback, deps?: DependencyList) {
  const cleanupRef = useHookstate<any>(null)
  const depsRef = useHookstate<any>(null)

  // noop unless component is mounted to ensure we can clean up correctly
  const isMounted = useHookstate(false)
  useLayoutEffect(() => {
    isMounted.set(true)
  }, [])

  // make sure deps are hooked
  useEffect(() => {}, deps)

  // only run effect when mounted and whenever deps change
  if (isMounted.value && depsDiff(depsRef.get(NO_PROXY_STEALTH), deps)) {
    depsRef.set(deps)

    // cleanup previous effect
    const cleanup = cleanupRef.get(NO_PROXY_STEALTH)
    if (cleanup) {
      cleanup()
    }

    // run effect
    cleanupRef.set(() => effect())
  }

  // make sure final cleanup is called on unmount
  useLayoutEffect(() => {
    return () => {
      const cleanup = cleanupRef.get(NO_PROXY_STEALTH)
      cleanup?.()
    }
  }, [])
}
