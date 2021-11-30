import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import matches from 'ts-matches'
import { EditorActions } from '../functions/EditorActions'

const GIZMO_SIZE = 10

/**
 * @author Abhishek Pathak <github.com/Abhishek-Pathak-Here>
 */
export default async function EditorActionSystem(world: World): Promise<System> {
  const executeCallbackFunctions = (cbFuncs: Set<any>) => {
    cbFuncs.forEach((cbFunc) => cbFunc())
  }
  world.receptors.push((action) => {
    matches(action)
    //.when(EditorActions.renderModeChanged.action.matchesFromAny,executeCallbackFunctions(EditorActions.renderModeChanged.callbackFunctions))
  })

  return () => {
    console.log('This is Editor Action System')
    world.receptors.forEach((receptor) => {
      world.outgoingActions.forEach((action) => {
        receptor(action)
        world.outgoingActions.delete(action)
      })
    })
  }
}
