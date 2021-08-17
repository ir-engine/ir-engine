import { Position, Polygon, MultiPolygon, Feature, Geometry } from 'geojson'
import * as THREE from 'three'
import { Group } from 'three'
import { NavMesh } from 'yuka'
import { Engine } from '../ecs/classes/Engine'
import { fetchRasterTiles, fetchVectorTiles, getCenterTile } from './MapBoxClient'
import { MapProps } from './MapProps'
import { createBuildings, createGround, createRoads, llToScene, setGroundScaleAndPosition } from './MeshBuilder'
import { NavMeshBuilder } from './NavMeshBuilder'
import { ILayerName, TileFeaturesByLayer } from './types'
import pc from 'polygon-clipping'
import { computeBoundingBox, scaleAndTranslate } from './GeoJSONFns'
import { METERS_PER_DEGREE_LL } from './constants'

let centerCoord = {}
let centerTile = {}

export const create = async function (renderer: THREE.WebGLRenderer, args: MapProps) {
  console.log('addmap called with args:', args)
  const center = await getStartCoords(args)
  const vectorTiles = await fetchVectorTiles(center)
  const rasterTiles = (args as any).showRasterTiles ? await fetchRasterTiles(center) : []

  const group = new Group()
  const buildingMesh = createBuildings(vectorTiles, center, renderer)
  const groundMesh = createGround(rasterTiles as any, center[1])
  const roadsMesh = createRoads(vectorTiles, center, renderer)

  setGroundScaleAndPosition(groundMesh, buildingMesh)

  group.add(buildingMesh)

  group.add(roadsMesh)

  group.add(groundMesh)

  const navMesh = generateNavMesh(vectorTiles, center, args.scale.x * METERS_PER_DEGREE_LL)

  group.position.multiplyScalar(args.scale.x)
  group.scale.multiplyScalar(args.scale.x)
  group.name = 'MapObject'
  centerCoord = Object.assign(center)
  centerTile = Object.assign(getCenterTile(center))

  return { mapMesh: group, buildingMesh, groundMesh, roadsMesh, navMesh }
}

function generateNavMesh(tiles: TileFeaturesByLayer[], center: Position, scale: number): NavMesh {
  const builder = new NavMeshBuilder()
  generateNavMeshGeometries(tiles, center, scale).forEach((g) => builder.addGeometry(g))
  return builder.build()
}

function generateNavMeshGeometries(
  tiles: TileFeaturesByLayer[],
  center: Position,
  scale: number
): (Polygon | MultiPolygon)[] {
  const buildingCount = tiles.reduce((count, tile) => count + tile.building.length, 0)
  const roadCount = tiles.reduce((count, tile) => count + tile.road.length, 0)

  let geometries: (Polygon | MultiPolygon)[]
  if (buildingCount > 100 && roadCount > 1) {
    geometries = collectGeometriesByLayer(tiles, 'road')
  } else {
    geometries = [computeNegativeInBoundingBox(collectGeometriesByLayer(tiles, 'building'))]
  }

  return geometries.map((g) => {
    return scaleAndTranslate(g, center, scale)
  })
}

// TODO add target param
function collectGeometriesByLayer(tiles: TileFeaturesByLayer[], layerName: ILayerName): (Polygon | MultiPolygon)[] {
  return tiles.reduce((acc, tiles) => acc.concat(tiles[layerName]), []).map((f) => f.geometry)
}

const computeNegativeInBoundingBox = function (geometries: (Polygon | MultiPolygon)[]): MultiPolygon {
  const gBbox = computeBoundingBox(geometries)
  let gNegative = [gBbox.coordinates]
  geometries.forEach((gPositive) => {
    // TODO use apply
    gNegative = pc.difference(gNegative as any, gPositive.coordinates as any)
  })
  return { type: 'MultiPolygon', coordinates: gNegative }
}

export const updateMap = async function (
  renderer: THREE.WebGLRenderer,
  args: MapProps,
  longtitude,
  latitude,
  position
) {
  console.log('addmap called with args:', args)
  const center = [longtitude, latitude]
  const vectorTiles = await fetchVectorTiles(center)
  const rasterTiles = (args as any).showRasterTiles ? await fetchRasterTiles(center) : []

  const group = new Group()

  group.add(createBuildings(vectorTiles, center, renderer))

  group.add(createRoads(vectorTiles, center, renderer))

  group.add(createGround(rasterTiles as any, center[1]))

  group.position.multiplyScalar(args.scale.x)
  group.scale.multiplyScalar(args.scale.x)
  group.name = 'MapObject'
  group.position.set(-position.x, 0, -position.z)
  console.log(group.position)
  centerCoord = Object.assign(center)
  Engine.scene.add(group)
  return group
}

export function getStartCoords(props: MapProps): Promise<Position> {
  if (props.useDeviceGeolocation) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(({ coords }) => resolve([coords.longitude, coords.latitude]), reject)
    )
  }

  // Default to downtown ATL
  return Promise.resolve([parseFloat(props.startLongitude) || -84.388, parseFloat(props.startLatitude) || 33.749])
}

export const getCoord = () => {
  return centerCoord
}

export const getTile = () => {
  return centerTile
}
