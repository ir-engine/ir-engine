import { Position, Polygon, MultiPolygon } from 'geojson'
import * as THREE from 'three'
import { Group } from 'three'
import { NavMesh } from 'yuka'
import { Engine } from '../ecs/classes/Engine'
import { fetchRasterTiles, fetchVectorTiles, getCenterTile } from './MapBoxClient'
import { MapProps } from './MapProps'
import { createBuildings, createGround, createRoads, llToScene, setGroundScaleAndPosition } from './MeshBuilder'
import { NavMeshBuilder } from './NavMeshBuilder'
import { TileFeaturesByLayer } from './types'
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

const generateNavMesh = function (tiles: TileFeaturesByLayer[], center: Position, scale: number): NavMesh {
  const builder = new NavMeshBuilder()
  const gBuildings = tiles
    .reduce((acc, tiles) => acc.concat(tiles.building), [])
    .map((feature) => {
      return scaleAndTranslate(feature.geometry as Polygon | MultiPolygon, center, scale)
    })

  const gGround = computeBoundingBox(gBuildings)
  let gBuildingNegativeSpace = [gGround.coordinates]
  gBuildings.forEach((gPositiveSpace) => {
    gBuildingNegativeSpace = pc.difference(gBuildingNegativeSpace as any, gPositiveSpace.coordinates as any)
  })
  builder.addGeometry({ type: 'MultiPolygon', coordinates: gBuildingNegativeSpace })
  return builder.build()
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
