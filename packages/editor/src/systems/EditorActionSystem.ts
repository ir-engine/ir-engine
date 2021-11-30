import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import matches from 'ts-matches'
import { EditorActions } from '../functions/EditorActions'

/**
 * @author Abhishek Pathak <github.com/Abhishek-Pathak-Here>
 */
export default async function EditorActionSystem(world: World): Promise<System> {
  const executeCallbackFunctions = (cbFuncs: Set<any>) => {
    console.log('The CallbackFunctions is:' + cbFuncs.size)
    cbFuncs.forEach((cbFunc) => cbFunc())
  }
  world.receptors.push((action) => {
    matches(action)
      .when(
        EditorActions.selectionChanged.action.matchesFromAny,
        executeCallbackFunctions(EditorActions.selectionChanged.callbackFunctions)
      )
      .when(
        EditorActions.beforeSelectionChanged.action.matchesFromAny,
        executeCallbackFunctions(EditorActions.beforeSelectionChanged.callbackFunctions)
      )
      .when(
        EditorActions.sceneGraphChanged.action.matchesFromAny,
        executeCallbackFunctions(EditorActions.sceneGraphChanged.callbackFunctions)
      )
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
