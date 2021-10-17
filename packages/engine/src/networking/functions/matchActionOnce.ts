import matches, { Validator } from 'ts-matches'
import { useWorld } from '../../ecs/functions/SystemHooks'

/**
 *
 * @param match the action to match to
 * @param callback the logic to run - returning truthy will cause the receptor to be removed
 */

export const matchActionOnce = <A, B>(match: Validator<A, B>, callback: (match: B) => boolean) => {
  const world = useWorld()
  function receptor(action) {
    matches(action).when(match, cb)
  }
  function cb(ac) {
    if (callback(ac)) {
      const idx = world.receptors.indexOf(receptor)
      world.receptors.splice(idx, 1)
    }
  }
  world.receptors.push(receptor)
}
