import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkWorldAction } from '../interfaces/NetworkWorldActions'
import { dispatchFromServer } from './dispatch'

export function sendClientObjectUpdate(entity: Entity, type: number, values: number[], data: string[] = []): void {
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchFromServer(NetworkWorldAction.editObject(networkObject.networkId, type, values, data))
}
