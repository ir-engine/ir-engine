import * as THREE from 'three'
import { createRoads, createGround, createBuildings } from './MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles, getCenterTile } from './MapBoxClient'
import { MapProps } from './MapProps'
import { Group } from 'three'
import { Engine } from '../ecs/classes/Engine'

let centerCoord = {}
let centerTile = {}

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
  group.name = 'Mappa'
  centerCoord = Object.assign(center)
  centerTile = Object.assign(getCenterTile(center))

  return group
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
  group.name = 'Mappa'
  group.position.set(-position.x, 0, -position.z)
  console.log(group.position)
  centerCoord = Object.assign(center)
  Engine.scene.add(group)
  return group
}

export const getCoord = () => {
  return centerCoord
}

export const getTile = () => {
  return centerTile
}
