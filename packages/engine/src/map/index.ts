import * as THREE from 'three'
import { createRoads, createGround, createBuildings } from './MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles } from './MapBoxClient'
import { MapProps } from './MapProps'
import { Group } from 'three'

export const create = async function (renderer: THREE.WebGLRenderer, args: MapProps) {
  console.log('addmap called with args:', args)
  const center = [parseFloat(args.startLongitude) || -84.388, parseFloat(args.startLatitude) || 33.749]
  const vectorTiles = await fetchVectorTiles(center)
  const rasterTiles = (args as any).showRasterTiles ? await fetchRasterTiles(center) : []

  const group = new Group()

  group.add(createBuildings(vectorTiles, center, renderer))

  group.add(createRoads(vectorTiles, center, renderer))

  group.add(createGround(rasterTiles as any, center[1]))

  group.position.multiplyScalar(args.scale.x)
  group.scale.multiplyScalar(args.scale.x)

  return group
}
