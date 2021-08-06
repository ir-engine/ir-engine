import * as THREE from 'three'
import { MapboxTileLoader } from './MapboxTileLoader'
import { buildMesh } from './MeshBuilder'
import { fetchVectorTiles, fetchRasterTiles } from './MapBoxClient'
import { MapProps } from './MapProps'

const useNew = true

export const addMap = async function (scene: THREE.Scene, renderer: THREE.WebGLRenderer, args: MapProps) {
  console.log('addmap called with args:', args)
  if (useNew) {
    // TODO use object
    const center = [parseFloat(args.startLongitude) || -84.388, parseFloat(args.startLatitude) || 33.749]
    const vectorTiles = await fetchVectorTiles(center)
    const rasterTiles = await fetchRasterTiles(center)
    const mesh = buildMesh(vectorTiles, rasterTiles as any, center, renderer)
    mesh.position.multiplyScalar(args.scale.x)
    mesh.scale.multiplyScalar(args.scale.x)

    scene.add(mesh)
  } else {
    new MapboxTileLoader(scene, {
      ...args,
      // default ATL if none provided
      lat: parseFloat(args.startLatitude) || 33.749,
      lng: parseFloat(args.startLongitude) || -84.388
    })
  }
}
