import { OrbitControls } from './OrbitControls'

export function getOrbitControls(camera, el): OrbitControls {
  return new OrbitControls(camera, el)
}
