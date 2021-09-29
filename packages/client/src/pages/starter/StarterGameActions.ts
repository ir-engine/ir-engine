import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { defineActionCreator, matches, matchesVector3 } from '@xrengine/engine/src/networking/interfaces/Action'
export class StarterAction {
  static spawnCubes = defineActionCreator({ type: 'starter.spawnCubes' })

  static spawnCube = defineActionCreator({
    ...NetworkWorldAction.spawnObject.actionShape,
    prefab: 'starter.cube',
    parameters: matches.shape({
      position: matchesVector3
    })
  })
}
