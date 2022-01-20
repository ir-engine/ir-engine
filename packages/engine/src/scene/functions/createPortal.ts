import { Euler, Quaternion, Vector3 } from 'three'
import { PortalComponent } from '../components/PortalComponent'

export const setRemoteLocationDetail = (
  portal: ReturnType<typeof PortalComponent.get>,
  spawnPosition: Vector3,
  spawnRotation: Euler
): void => {
  portal.remoteSpawnPosition = new Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z)
  portal.remoteSpawnEuler = new Euler(spawnRotation.x, spawnRotation.y, spawnRotation.z, 'XYZ')
  portal.remoteSpawnRotation = new Quaternion().setFromEuler(portal.remoteSpawnEuler)
}
