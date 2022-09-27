import matches, { Validator } from 'ts-matches'

import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

/**
 * @deprecated
 * @param match the action to match to
 * @param callback the logic to run - returning truthy will cause the receptor to be removed
 */
export const matchActionOnce = <A, B>(match: Validator<A, B>, callback: (match: B) => boolean | void) => {
  function receptor(action) {
    matches(action).when(match, cb)
  }
  function cb(ac) {
    const response = callback(ac)
    if (typeof response === 'undefined' || response === true) {
      removeActionReceptor(receptor)
    }
  }
  addActionReceptor(receptor)
}
