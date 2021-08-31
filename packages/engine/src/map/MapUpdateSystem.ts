import { defineQuery, defineSystem, enterQuery, System } from 'bitecs'
import { createMapObjects, getCoord, getScaleArg, getTile } from '.'
import { PI } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { addComponent, getComponent, removeComponent } from '../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { llToTile } from './MapBoxClient'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { NavMeshComponent } from '../navigation/component/NavMeshComponent'

export async function refreshMap(entity, world, longtitude, latitude): Promise<void> {
  const map = getComponent(entity, MapComponent)
  // map.loading = true
  // const loadingTile = llToTile([longtitude, latitude])
  // console.log('updateMap to tile', loadingTile)

  const { mapMesh, navMesh, groundMesh } = await createMapObjects(map.center, [longtitude, latitude], map.args)

  // map.currentTile = loadingTile

  // /*
  // // TODO: it does not work this way, but probably should
  // removeComponent(entity, Object3DComponent)
  // addComponent(entity, Object3DComponent, { value: mapMesh })
  //  */
  // const mapObjectComponent = getComponent(entity, Object3DComponent)
  // const prevMapMesh = mapObjectComponent.value
  // mapMesh.position.copy(prevMapMesh.position)
  // mapMesh.rotation.copy(prevMapMesh.rotation)
  // mapMesh.scale.copy(prevMapMesh.scale)

  // prevMapMesh.parent.add(mapMesh)
  // prevMapMesh.removeFromParent()
  // mapObjectComponent.value = mapMesh

  // // getComponent(currentEnt, Object3DComponent).value.clear()
  // // getComponent(currentEnt, Object3DComponent).value.add(mapMesh)

  // // TODO check and fix
  // removeComponent(entity, NavMeshComponent)
  // if (navMesh && groundMesh) {
  //   addComponent(entity, NavMeshComponent, {
  //     yukaNavMesh: navMesh,
  //     navTarget: groundMesh
  //   })
  // }

  // map.loading = false
}

export const MapUpdateSystem = async (): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  const labelsQuery = defineQuery([GeoLabelSetComponent])

  return defineSystem((world: ECSWorld) => {
    const maps = mapsQuery(world)
    if (!maps.length) {
      return
    }

    const mapEntity = maps[0] // TODO: iterate all maps
    const map = getComponent(mapEntity, MapComponent)
    if (map.loading) {
      // skip map check?
      return
    }

    const viewerPosition = getComponent(map.viewer, TransformComponent).position
    //Calculate new move coords
    const startLong = map.center[0]
    const startLat = map.center[1]
    // TODO: use map component properties? or maps transformComponent

    const viewerDistanceFromCenter = Math.hypot(viewerPosition.x, viewerPosition.z)
    if (viewerDistanceFromCenter >= map.triggerRefreshRadius) {
      const mapScale = getComponent(mapEntity, TransformComponent).scale.x
      const longtitude = viewerPosition.x / (111134.861111 * mapScale) + startLong
      const latitude = -viewerPosition.z / (Math.cos((startLat * PI) / 180) * 111321.377778 * mapScale) + startLat
      refreshMap(mapEntity, world, longtitude, latitude)
    }

    // // TODO: use sceneToLl
    // const longtitude = viewerPosition.x / (111134.861111 * mapScale) + startLong
    // const latitude = -viewerPosition.z / (Math.cos((startLat * PI) / 180) * 111321.377778 * mapScale) + startLat

    ////get Current Tile
    //const mapTile = map.currentTile
    //// converts player position to tile coordinate
    //const playerTile = llToTile([longtitude, latitude])

    // if (playerTile[0] && mapTile[0]) {
    //   if (mapTile[0] == playerTile[0] && mapTile[1] == playerTile[1]) {
    //     console.log('in center')
    //   } else {
    //     updateMap(mapEntity, longtitude, latitude)
    //   }
    // }

    for (const entity of labelsQuery(world)) {
      const labels = getComponent(entity, GeoLabelSetComponent).value
      for (const label of labels) {
        label.onUpdate(Engine.camera)
      }
    }

    return world
  })
}
