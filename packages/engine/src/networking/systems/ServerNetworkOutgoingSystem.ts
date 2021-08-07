import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { SIXDOFType } from '../../common/types/NumericalTypes'
import { System } from '../../ecs/classes/System'
import { Not } from '../../ecs/functions/ComponentFunctions'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Input } from '../../input/components/Input'
import { BaseInput } from '../../input/enums/BaseInput'
import { InputValue } from '../../input/interfaces/InputValue'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Network } from '../classes/Network'
import { NetworkObject } from '../components/NetworkObject'
import { TransformStateInterface } from '../interfaces/WorldState'
import { TransformStateModel } from '../schema/transformStateSchema'
import { WorldStateModel } from '../schema/worldStateSchema'

/** System class to handle outgoing messages. */
export class ServerNetworkOutgoingSystem extends System {
  /** Call execution on server */
  execute = (delta: number): void => {
    const transformState: TransformStateInterface = {
      tick: Network.instance.tick,
      time: Date.now(),
      transforms: [],
      ikTransforms: []
    }

    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    for (const entity of this.queryResults.networkTransforms.all) {
      const transformComponent = getComponent(entity, TransformComponent)
      const networkObject = getComponent(entity, NetworkObject)
      const currentPosition = transformComponent.position
      const snapShotTime = networkObject.snapShotTime

      transformState.transforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
        // TODO: reduce quaternions over network to three components
        qX: transformComponent.rotation.x,
        qY: transformComponent.rotation.y,
        qZ: transformComponent.rotation.z,
        qW: transformComponent.rotation.w
      })
    }

    for (const entity of this.queryResults.avatarTransforms.all) {
      const transformComponent = getComponent(entity, TransformComponent)
      const avatar = getComponent(entity, AvatarComponent)
      const networkObject = getComponent(entity, NetworkObject)
      const currentPosition = transformComponent.position
      const snapShotTime = networkObject.snapShotTime

      transformState.transforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
        qX: avatar.viewVector.x,
        qY: avatar.viewVector.y,
        qZ: avatar.viewVector.z,
        qW: 0 // TODO: reduce quaternions over network to three components
      })
    }

    for (const entity of this.queryResults.ikTransforms.all) {
      const networkObject = getComponent(entity, NetworkObject)
      const snapShotTime = networkObject.snapShotTime

      const input = getComponent(entity, Input)

      const hmd = input.data.get(BaseInput.XR_HEAD) as InputValue<SIXDOFType>
      const left = input.data.get(BaseInput.XR_CONTROLLER_LEFT_HAND) as InputValue<SIXDOFType>
      const right = input.data.get(BaseInput.XR_CONTROLLER_RIGHT_HAND) as InputValue<SIXDOFType>

      if (!hmd?.value || !left?.value || !right?.value) continue

      transformState.ikTransforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        hmd: hmd.value,
        left: left.value,
        right: right.value
      })
    }

    try {
      if (
        Network.instance.worldState.clientsConnected.length ||
        Network.instance.worldState.clientsDisconnected.length ||
        Network.instance.worldState.createObjects.length ||
        Network.instance.worldState.editObjects.length ||
        Network.instance.worldState.destroyObjects.length ||
        Network.instance.worldState.gameState.length ||
        Network.instance.worldState.gameStateActions.length
      ) {
        const bufferReliable = WorldStateModel.toBuffer(Network.instance.worldState)
        if (!bufferReliable) {
          console.warn('World state buffer is null')
          console.warn(Network.instance.worldState)
        } else {
          if (Network.instance.transport && typeof Network.instance.transport.sendReliableData === 'function')
            Network.instance.transport.sendReliableData(bufferReliable)
        }

        Network.instance.worldState.clientsConnected = []
        Network.instance.worldState.clientsDisconnected = []
        Network.instance.worldState.createObjects = []
        Network.instance.worldState.editObjects = []
        Network.instance.worldState.destroyObjects = []
        Network.instance.worldState.gameState = []
        Network.instance.worldState.gameStateActions = []
      }

      const bufferUnreliable = TransformStateModel.toBuffer(transformState)
      if (!bufferUnreliable) {
        console.warn('Transform buffer is null')
        console.warn(transformState)
      } else {
        if (Network.instance.transport && typeof Network.instance.transport.sendData === 'function')
          Network.instance.transport.sendData(bufferUnreliable)
      }
    } catch (e) {
      console.error(Network.instance.worldState)
    }
  }

  /** System queries. */
  static queries: any = {
    networkTransforms: {
      components: [Not(AvatarComponent), NetworkObject, TransformComponent]
    },
    avatarTransforms: {
      components: [AvatarComponent, NetworkObject, TransformComponent]
    },
    ikTransforms: {
      components: [XRInputSourceComponent, NetworkObject, TransformComponent]
    }
  }
}
