import { getStartCoords } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { MapComponent } from '../../map/MapComponent'
import { Group, Vector3 } from 'three'
import ArrayKeyedMap from '../../map/classes/ArrayKeyedMap'
import { createProductionPhases } from '../../map/functions/createProductionPhases'
import execTasksCompletely from '../../map/functions/execTasksCompletely'
import { FeatureKey, MapDerivedFeatureComplete, MapDerivedFeatureGeometry, TileKey, VectorTile } from '../../map/types'
import FetchTileTask from '../../map/classes/FetchTileTask'
import TileCache from '../../map/classes/TileCache'
import FeatureCache from '../../map/classes/FeatureCache'
import { Feature } from 'geojson'
import ExtractTileFeaturesTask from '../../map/classes/ExtractTileFeaturesTask'
import CreateGeometryTask from '../../map/classes/CreateGeometryTask'
import CreateCompleteObjectTask from '../../map/classes/CreateCompleteObjectTask'

const MAX_CACHED_FEATURES = 1024 * 8

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  const minimumSceneRadius = 600

  const mapComponent = {
    center,
    originalCenter: center,
    triggerRefreshRadius: 200,
    minimumSceneRadius,
    fetchTilesTasks: new ArrayKeyedMap<TileKey, FetchTileTask>(),
    tileCache: new TileCache<VectorTile>(16),
    extractTilesTasks: new ArrayKeyedMap<TileKey, ExtractTileFeaturesTask>(),
    featureCache: new FeatureCache<Feature>(MAX_CACHED_FEATURES),
    geometryTasks: new ArrayKeyedMap<FeatureKey, CreateGeometryTask>(),
    geometryCache: new FeatureCache<MapDerivedFeatureGeometry>(MAX_CACHED_FEATURES),
    completeObjectsTasks: new ArrayKeyedMap<FeatureKey, CreateCompleteObjectTask>(),
    completeObjects: new FeatureCache<MapDerivedFeatureComplete>(MAX_CACHED_FEATURES),
    args
  }

  addComponent(entity, MapComponent, mapComponent)

  const mapObject3D = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, null)
  }

  // TODO use UpdatableComponent for labels

  const phases = createProductionPhases(
    mapComponent.fetchTilesTasks,
    mapComponent.tileCache,
    mapComponent.extractTilesTasks,
    mapComponent.featureCache,
    mapComponent.geometryTasks,
    mapComponent.geometryCache,
    mapComponent.completeObjectsTasks,
    mapComponent.completeObjects,
    mapComponent.center,
    mapComponent.originalCenter,
    mapComponent.minimumSceneRadius,
    // TODO how to get transform components?
    new Vector3(),
    0.2
  )
  await execTasksCompletely(phases)
}
