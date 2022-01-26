//@ts-nocheck
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { isZero } from '@xrengine/common/src/utils/mathUtils'
import { arraysAreEqual } from '@xrengine/common/src/utils/miscUtils'
import { pipe } from 'bitecs'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { NetworkTransport } from '../interfaces/NetworkTransport'
import { Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { createDataWriter } from '../serialization/AoS/DataWriter'

/***********
 * QUERIES *
 **********/

export const networkTransformsQuery = defineQuery([NetworkObjectComponent, TransformComponent])
const ownedNetworkTransformsQuery = defineQuery([NetworkObjectOwnedTag, NetworkObjectComponent, TransformComponent])

const ikTransformsQuery = isClient
  ? defineQuery([AvatarControllerComponent, XRInputSourceComponent])
  : defineQuery([XRInputSourceComponent])

const xrHandsQuery = isClient
  ? defineQuery([AvatarControllerComponent, XRHandsInputComponent])
  : defineQuery([XRHandsInputComponent])

/****************
 * DATA SENDING *
 ***************/

const sendActionsOnTransport = (transport: NetworkTransport) => (world: World) => {
  const { outgoingActions } = world

  for (const o of outgoingActions) console.log('OUTGOING', o)

  try {
    transport.sendActions(outgoingActions)
  } catch (e) {
    console.error(e)
  }

  outgoingActions.clear()

  return world
}

const sendDataOnTransport = (transport: NetworkTransport) => (data) => {
  try {
    transport.sendData(data)
  } catch (e) {
    console.error(e)
  }
}

export default async function OutgoingNetworkSystem(world: World): Promise<System> {
  const worldTransport = Network.instance.transportHandler.getWorldTransport()
  const sendActions = sendActionsOnTransport(worldTransport)
  const sendData = sendDataOnTransport(worldTransport)

  const serialize = createDataWriter()

  return () => {
    if (!Engine.isInitialized) return

    const ents = isClient ? ownedNetworkTransformsQuery(world) : networkTransformsQuery(world)
    const data = serialize(world, ents)

    // console.log('///////////OutgoingNetworkSystem')
    // console.log(data.byteLength)
    // console.log('////////////////////////////////')

    // side effect - network IO
    sendActions(world)
    sendData(data)
  }
}
