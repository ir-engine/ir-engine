import { System, Entity, World } from "ecsy"
import NetworkOwner from "../components/NetworkOwner"

export class NetworkSystem extends System {
  _isInitialized: boolean
  _sessionEntity: Entity

  static queries: any = {
    networkSession: {
      components: [NetworkSession],
      listen: {
        added: true,
        changed: true,
        removed: true
      }
    },
    networkObject: {
      components: [NetworkObject]
    },
    networkOwners: {
      components: [NetworkOwner]
    }
  }

  execute(delta: number): void {
    if (!this._isInitialized) return
    // Ask transport for all new messages
  }

  initializeSession(world: World, transport?: Transport) {
    this._sessionEntity = world.createEntity("NetworkSession")
    this._sessionEntity.addComponent(NetworkSession)
    this._isInitialized = true
    this._sessionEntity.getComponent(NetworkSession).transport = transport
    transport.initialize()
  }

  deinitializeSession() {
    this._sessionEntity?.remove()
    this._isInitialized = false
    this._sessionEntity.getComponent(NetworkSession).deinitialize()
  }
}
