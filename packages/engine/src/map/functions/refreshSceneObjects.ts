import { getComponent } from '../../ecs/functions/EntityFunctions'
import { MapComponent } from '../MapComponent'
import { Entity } from '../../ecs/classes/Entity'
import { ECSWorld } from '../../ecs/classes/World'
import { createMapObjects } from '..'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GeoLabelSetComponent } from '../GeoLabelSetComponent'

export default async function refreshSceneObjects(
  mapEntity: Entity,
  viewerEntity: Entity,
  ecsWorld: ECSWorld
): Promise<void> {
  const map = getComponent(mapEntity, MapComponent, false, ecsWorld)
  const mapTransform = getComponent(mapEntity, TransformComponent, false, ecsWorld)
  const viewerTransform = getComponent(viewerEntity, TransformComponent, false, ecsWorld)
  const { mapMesh, labels } = await createMapObjects(map.center, map.minimumSceneRadius, map.args)

  mapTransform.position.copy(viewerTransform.position)
  mapTransform.position.y = 0

  // TODO figure out a better way to do this
  const oldMapMesh = getComponent(mapEntity, Object3DComponent, false, ecsWorld).value

  const labelsComponent = getComponent(mapEntity, GeoLabelSetComponent)
  const oldLabels = labelsComponent.value

  oldLabels.forEach((label) => {
    oldMapMesh.remove(label.object3d)
  })

  labels.forEach((label) => {
    label.object3d.position.add(mapTransform.position)
    mapMesh.add(label.object3d)
  })

  labelsComponent.value = new Set(labels)

  oldMapMesh.clear().add(mapMesh)
}
