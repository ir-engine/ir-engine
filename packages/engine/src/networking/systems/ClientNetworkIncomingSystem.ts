import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions'
import { Group } from 'three'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { TransformStateModel } from '../schema/transformStateSchema'
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
        const transformState = TransformStateModel.fromBuffer(buffer)
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
          const newServerSnapshot = createSnapshot(transformState.transforms)
          // server correction, time when client send inputs
          newServerSnapshot.timeCorrection = myPlayerTime
            ? myPlayerTime.snapShotTime + Network.instance.timeSnaphotCorrection
            : 0
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
          const { hmd, left, right } = ikTransform
          xrInputSourceComponent.head.position.fromArray(hmd)
          xrInputSourceComponent.head.quaternion.fromArray(hmd, 3)
          xrInputSourceComponent.controllerLeft.position.fromArray(left)
          xrInputSourceComponent.controllerLeft.quaternion.fromArray(left, 3)
          xrInputSourceComponent.controllerRight.position.fromArray(right)
          xrInputSourceComponent.controllerRight.quaternion.fromArray(right, 3)
        }
      } catch (e) {
        console.log(e)
      }
    }

    return world
  })
}
