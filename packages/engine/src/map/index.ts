import * as THREE from 'three'
import { MapboxTileLoader } from './MapboxTileLoader'
import { fetchTiles, buildMesh } from './MeshBuilder'
import { MapProps } from './MapProps'
import { Vector3 } from 'three'

const useNew = true

export const addMap = async function (scene: THREE.Scene, renderer: THREE.WebGLRenderer, args: MapProps) {
  console.log('addmap called with args:', args)
  if (useNew) {
    // TODO use object
    const center = [parseFloat(args.startLongitude) || -84.388, parseFloat(args.startLatitude) || 33.749]
    const features = await fetchTiles(center)
    const mesh = buildMesh(features, center, renderer)
    mesh.position.multiplyScalar(args.scale.x)
    mesh.scale.multiplyScalar(args.scale.x)
    mesh.name = 'Mappa'
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

export const updateMap = async function (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  args: MapProps,
  longtitude,
  latitude,
  position: Vector3
) {
  console.log('updateMap', args)
  console.log(scene)

  const center = [longtitude, latitude]
  const features = await fetchTiles(center)
  const mesh = buildMesh(features, center, renderer)
  mesh.position.multiplyScalar(1)
  mesh.position.set(position.x, 0, position.z)
  mesh.scale.multiplyScalar(1)
  mesh.name = 'Mappa'
  scene.add(mesh)
}
