import { getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { MapComponent } from '../../map/MapComponent'
import { Group, Vector3 } from 'three'
import { createProductionPhases } from '../../map/functions/createProductionPhases'
import actuateEager from '../../map/functions/actuateEager'
import createStore from '../../map/functions/createStore'
import { useWorld } from '../../ecs/functions/SystemHooks'

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  const store = createStore(center, args, 20, 900)
  addComponent(entity, MapComponent, store)

  const mapObject3D = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, null)
  }

  const phases = createProductionPhases(
    useWorld(),
    store.fetchTilesTasks,
    store.tileCache,
    store.extractTilesTasks,
    store.featureCache,
    store.geometryTasks,
    store.geometryCache,
    store.completeObjectsTasks,
    store.completeObjects,
    store.labelTasks,
    store.labelCache,
    store.center,
    store.originalCenter,
    store.minimumSceneRadius,
    // TODO how to get transform components? in the meantime, guessing isn't too bad
    new Vector3(0, 0, 0),
    1
  )
  await actuateEager(phases)
}
