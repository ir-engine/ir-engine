import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { clientNetworkReceptor } from '../functions/clientNetworkReceptor'

export const ClientNetworkIncomingSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    const localAvatarNetworkId = getComponent(Network.instance.localClientEntity, NetworkObjectComponent)?.networkId

    for (const action of Network.instance.incomingActions) clientNetworkReceptor(world, action as any)

    const unreliableQueue = Network.instance.incomingMessageQueueUnreliable
    while (unreliableQueue.getBufferLength() > 0) {
      const buffer = unreliableQueue.pop()
      try {
        const transformState = WorldStateModel.fromBuffer(buffer)
        if (!transformState) throw new Error("Couldn't deserialize buffer, probably still reading the wrong one")

        if (Network.instance.tick < transformState.tick - 1) {
          // we dropped packets
          // Check how many
          // If our queue empty? Request immediately
          // Is our queue not empty? Inspect tick numbers
          // Did they fall in our range?
          // Send a request for the ones that didn't
        }

        Network.instance.tick = transformState.tick

        if (transformState.transforms.length) {
          const myPlayerTime = transformState.transforms.find((v) => v.networkId === localAvatarNetworkId)
          
          const newServerSnapshot = createSnapshot(transformState.transforms.map((transform) => {
            return {
              networkId: transform.networkId,
              x: transform.pose[0],
              y: transform.pose[1],
              z: transform.pose[2],
              qX: transform.pose[3],
              qY: transform.pose[4],
              qZ: transform.pose[5],
              qW: transform.pose[6],
            }
          }))

          // interpolation, time when server send transforms
          newServerSnapshot.time = transformState.time
          Network.instance.snapshot = newServerSnapshot
          addSnapshot(newServerSnapshot)
        }

        for (const ikTransform of transformState.ikTransforms) {
          if (!Network.instance.networkObjects[ikTransform.networkId]) continue
          const entity = Network.instance.networkObjects[ikTransform.networkId].entity
          // ignore our own transform
          if (entity === Network.instance.localClientEntity || !hasComponent(entity, XRInputSourceComponent)) continue
          const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
          const { headPose, leftPose, rightPose } = ikTransform
          xrInputSourceComponent.head.position.fromArray(headPose)
          xrInputSourceComponent.head.quaternion.fromArray(headPose, 3)
          xrInputSourceComponent.controllerLeft.position.fromArray(leftPose)
          xrInputSourceComponent.controllerLeft.quaternion.fromArray(leftPose, 3)
          xrInputSourceComponent.controllerRight.position.fromArray(rightPose)
          xrInputSourceComponent.controllerRight.quaternion.fromArray(rightPose, 3)
        }
      } catch (e) {
        console.log(e)
      }
    }

    return world
  })
}
