import * as THREE from 'three'
import { MapboxTileLoader } from './MapboxTileLoader'
import { fetchFeatures, buildMesh } from './MeshBuilder'

const useNew = true

export const addMap = async function (scene: THREE.Scene) {
  if (useNew) {
    // TODO use object
    const center = [-84.388, 33.79]
    const features = await fetchFeatures(center)
    const mesh = buildMesh(features, center)
    scene.add(mesh)
  } else {
    new MapboxTileLoader(scene, {
      // NYC
      // latitude: 40.707,
      // longitude: -74.01

      // SF
      // lat: 37.7749,
      // lng: -122.4194

      // ATL
      lat: 33.749,
      lng: -84.388
    })
  }
}
