import { getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { MapComponent } from '../../map/MapComponent'
import { Group } from 'three'
import getPhases from '../../map/functions/getPhases'
import actuateEager from '../../map/functions/actuateEager'
import createStore from '../../map/functions/createStore'
import { Engine } from '../../ecs/classes/Engine'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  const store = createStore(center, [0, 0], 40, 800, args.scale?.x || 1, args)
  addComponent(entity, MapComponent, store)

  const mapObject3D = new Group()
  const navigationRaycastTarget = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, { object3d: new Group() })
  }

  await actuateEager(store, getPhases({ exclude: ['navigation'] }))

  navigationRaycastTarget.scale.setScalar(store.scale)
  Engine.scene.add(navigationRaycastTarget)

  addComponent(entity, NavMeshComponent, {
    /*
  * [Mappa#2](https://github.com/lagunalabsio/mappa/issues/2)
    yukaNavMesh: store.navMesh,
  */
    navTarget: navigationRaycastTarget
  })
}
