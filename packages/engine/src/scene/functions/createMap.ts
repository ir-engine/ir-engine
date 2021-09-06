import { enqueueTasks, getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { GeoLabelSetComponent } from '../../map/GeoLabelSetComponent'
import { MapComponent } from '../../map/MapComponent'
import { Group } from 'three'

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  const minimumSceneRadius = 600

  addComponent(entity, MapComponent, {
    center,
    originalCenter: center,
    triggerRefreshRadius: 200,
    minimumSceneRadius,
    args
  })

  const { navMesh, groundMesh, labels } = await enqueueTasks(center, minimumSceneRadius, args)

  const mapObject3D = new Group()

  labels.forEach((label) => {
    mapObject3D.add(label.object3d)
  })

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  addComponent(entity, NavMeshComponent, {
    yukaNavMesh: navMesh,
    navTarget: groundMesh
  })
  addComponent(entity, GeoLabelSetComponent, { value: new Set(labels) })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, null)
  }
}
