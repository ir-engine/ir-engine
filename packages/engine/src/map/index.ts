import * as THREE from 'three'
import { MapboxTileLoader } from './MapboxTileLoader'
import { fetchFeatures, buildMesh } from './MeshBuilder'
import { MapProps } from './MapProps'

const useNew = false

export const addMap = async function (scene: THREE.Scene, renderer: THREE.WebGLRenderer, args: MapProps) {
  console.log("addmap called with args:", args);
  if (useNew) {
    // TODO use object
    const center = [args.startLongitude, args.startLatitude]
    const features = await fetchFeatures(center)
    const mesh = buildMesh(features, center, renderer)
    scene.add(mesh)
  } else {
    new MapboxTileLoader(scene, {
      ...args,
      // default ATL if none provided
      lat: args.startLatitude || 33.749,
      lng: args.startLongitude || -84.388
    })
  }
}
