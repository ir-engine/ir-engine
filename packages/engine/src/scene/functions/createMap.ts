import { getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { MapComponent } from '../../map/MapComponent'
import { Group, Vector3 } from 'three'
import getPhases from '../../map/functions/getPhases'
import actuateEager from '../../map/functions/actuateEager'
import createStore from '../../map/functions/createStore'

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  const store = createStore(center, [0, 0], 20, 1200, args.scale.x, args)
  addComponent(entity, MapComponent, store)

  const mapObject3D = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, null)
  }

  await actuateEager(store, getPhases())
}
