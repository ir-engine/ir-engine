import * as THREE from 'three'
import { createRoads, createGround, createBuildings, setGroundScaleAndPosition } from './MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles } from './MapBoxClient'
import { MapProps } from './MapProps'
import { Group } from 'three'
import { Position } from 'geojson'

export const create = async function (renderer: THREE.WebGLRenderer, args: MapProps) {
  console.log('addmap called with args:', args)
  const center = await getStartCoords(args)
  const vectorTiles = await fetchVectorTiles(center)
  const rasterTiles = (args as any).showRasterTiles ? await fetchRasterTiles(center) : []

  const group = new Group()
  const buildingMesh = createBuildings(vectorTiles, center, renderer)
  const groundMesh = createGround(rasterTiles as any, center[1])

  setGroundScaleAndPosition(groundMesh, buildingMesh)

  group.add(buildingMesh)

  group.add(createRoads(vectorTiles, center, renderer))

  group.add(groundMesh)

  group.position.multiplyScalar(args.scale.x)
  group.scale.multiplyScalar(args.scale.x)

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
