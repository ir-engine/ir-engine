import { getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { Group } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { MapAction, mapReducer } from '../../map/MapReceptor'
import { MapComponent } from '../../map/MapComponent'
import { getPhases, startPhases } from '../../map/functions/PhaseFunctions'

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  addComponent(entity, MapComponent, {})

  const mapObject3D = new Group()
  const navigationRaycastTarget = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, { object3d: new Group() })
  }

  const state = mapReducer(null, MapAction.initialize(center, args.scale?.x))
  await startPhases(state, await getPhases({ exclude: ['navigation'] }))

  navigationRaycastTarget.scale.setScalar(state.scale)
  Engine.scene.add(navigationRaycastTarget)

  addComponent(entity, NavMeshComponent, {
    /*
  * [Mappa#2](https://github.com/lagunalabsio/mappa/issues/2)
    yukaNavMesh: store.navMesh,
  */
    navTarget: navigationRaycastTarget
  })
}
