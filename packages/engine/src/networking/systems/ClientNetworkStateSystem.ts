import { NetworkObject } from '../components/NetworkObject'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity
} from '../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { NetworkObjectUpdateMap } from '../templates/NetworkObjectUpdates'
import { Network } from '../classes/Network'
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions'
import { PrefabType } from '../templates/PrefabType'
import { applyActionComponent } from '../../game/functions/functionsActions'
import { applyStateToClient } from '../../game/functions/functionsState'
import { System } from '../../ecs/classes/System'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { ClientInputModel } from '../schema/clientInputSchema'
import { Vault } from '../classes/Vault'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Quaternion, Vector3 } from 'three'
import { applyVectorMatrixXZ } from '../../common/functions/applyVectorMatrixXZ'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/worldStateSchema'
import { TransformStateModel } from '../schema/transformStateSchema'
import { spawnPrefab } from '../functions/spawnPrefab'

/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

function searchSameInAnotherId(objectToCreate) {
  if (objectToCreate.prefabType === PrefabType.Player) {
    return Object.keys(Network.instance.networkObjects)
      .map(Number)
      .find((key) => Network.instance.networkObjects[key]?.ownerId === objectToCreate.ownerId)
  } else {
    return Object.keys(Network.instance.networkObjects)
      .map(Number)
      .find((key) => Network.instance.networkObjects[key]?.uniqueId === objectToCreate.uniqueId)
  }
}

function syncNetworkObjectsTest(createObjects) {
  createObjects?.forEach((objectToCreate) => {
    if (!Network.instance.networkObjects[objectToCreate.networkId]) return
    if (
      objectToCreate.uniqueId === Network.instance.networkObjects[objectToCreate.networkId]?.uniqueId &&
      objectToCreate.ownerId === Network.instance.networkObjects[objectToCreate.networkId]?.ownerId
    )
      return

    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .forEach((key) => {
        if (Network.instance.networkObjects[key].component == null) {
          console.warn('TRY RESTART SERVER, MAYBE ON SERVER DONT CREATE THIS LOCATION')
        }
        if (
          Network.instance.networkObjects[key].component.uniqueId === objectToCreate.uniqueId &&
          Network.instance.networkObjects[key].component.ownerId === objectToCreate.ownerId
        ) {
          console.warn(
            '*createObjects* Correctiong networkObjects as a server id: ' +
              objectToCreate.networkId +
              ' and we now have id: ' +
              key
          )
          const tempCorrect = Network.instance.networkObjects[key]
          const tempMistake = Network.instance.networkObjects[objectToCreate.networkId]
          Network.instance.networkObjects[key] = tempMistake
          Network.instance.networkObjects[objectToCreate.networkId] = tempCorrect
          getMutableComponent(Network.instance.networkObjects[key].component.entity, NetworkObject).networkId = key
          getMutableComponent(
            Network.instance.networkObjects[objectToCreate.networkId].component.entity,
            NetworkObject
          ).networkId = objectToCreate.networkId
        }
      })
  })
}

function syncPhysicsObjects(objectToCreate) {
  if (
    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .every((key) => Network.instance.networkObjects[key].ownerId != objectToCreate.ownerId)
  ) {
    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .forEach((key) => {
        if (key === Number(objectToCreate.networkId)) {
          const tempCorrect = Network.instance.networkObjects[key]
          Network.instance.networkObjects[key] = undefined
          const newId = Network.getNetworkId()
          Network.instance.networkObjects[newId] = tempCorrect
          getMutableComponent(Network.instance.networkObjects[newId].component.entity, NetworkObject).networkId = newId
        }
      })
  }
}

const vector3_0 = new Vector3()
const vector3_1 = new Vector3()
const quat = new Quaternion()
const forwardVector = new Vector3(0, 0, 1)

/** System class for network system of client. */
export class ClientNetworkStateSystem extends System {
  static EVENTS = {
    CONNECT: 'CLIENT_NETWORK_SYSTEM_CONNECT',
    CONNECTION_LOST: 'CORE_CONNECTION_LOST'
  }

  dispose() {
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.CONNECT_TO_WORLD)
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.JOINED_WORLD)
  }

  /**
   * Executes the system.
   * Call logic based on whether system is on the server or on the client.
   *
   * @param delta Time since last frame.
   */
  execute = (delta: number): void => {
    // Client logic
    const reliableQueue = Network.instance.incomingMessageQueueReliable
    // For each message, handle and process
    while (reliableQueue.getBufferLength() > 0) {
      const buffer = reliableQueue.pop()
      try {
        const worldState = WorldStateModel.fromBuffer(buffer)
        if (!worldState) throw new Error("Couldn't deserialize buffer, probably still reading the wrong one")
        // Handle all clients that connected this frame
        for (const connectingClient in worldState.clientsConnected) {
          // Add them to our client list
          const newClient = worldState.clientsConnected[connectingClient]
          Network.instance.clients[newClient.userId] = {
            userId: newClient.userId,
            avatarDetail: newClient.avatarDetail
          }
        }

        // Handle all clients that disconnected this frame
        for (const disconnectingClient in worldState.clientsDisconnected) {
          if (worldState.clientsConnected[disconnectingClient] !== undefined) {
            // Remove them from our client list
            console.log(worldState.clientsConnected[disconnectingClient].userId, ' disconnected')
            delete Network.instance.clients[worldState.clientsConnected[disconnectingClient].userId]
          } else {
            console.warn('Client disconnected but was not found in our client list')
          }
        }

        // Handle all network objects created this frame
        for (const objectToCreateKey in worldState.createObjects) {
          const objectToCreate = worldState.createObjects[objectToCreateKey]
          if (!Network.instance.schema.prefabs.has(objectToCreate.prefabType)) {
            console.log('prefabType not found', objectToCreate.prefabType)
            continue
          }

          const isIdFull = Network.instance.networkObjects[objectToCreate.networkId] != undefined
          const isSameUniqueId =
            isIdFull &&
            Network.instance.networkObjects[objectToCreate.networkId].component.uniqueId === objectToCreate.uniqueId

          const entityExistsInAnotherId = searchSameInAnotherId(objectToCreate)

          if (isSameUniqueId) {
            console.error('[Network]: this player id already exists, please reconnect', objectToCreate.networkId)
            continue
          }

          if (typeof entityExistsInAnotherId !== 'undefined') {
            console.warn(
              '[Network]: Found local client in a different networkId. Was ',
              entityExistsInAnotherId,
              'now',
              objectToCreate.networkId
            )

            // set existing entity to new id
            Network.instance.networkObjects[objectToCreate.networkId] =
              Network.instance.networkObjects[entityExistsInAnotherId]

            // remove old id
            delete Network.instance.networkObjects[entityExistsInAnotherId]

            // change network component id
            Network.instance.networkObjects[objectToCreate.networkId].component.networkId = objectToCreate.networkId

            // if it's the local avatar
            if (objectToCreate.networkId === Network.instance.localAvatarNetworkId) {
              Network.instance.localAvatarNetworkId = objectToCreate.networkId
            }

            continue
          }

          if (isIdFull) {
            console.warn('[Network]: creating an object with an existing newtorkId...', objectToCreate.networkId)
            syncPhysicsObjects(objectToCreate)
          }

          if (Network.instance.networkObjects[objectToCreate.networkId] === undefined) {
            spawnPrefab(
              objectToCreate.prefabType,
              objectToCreate.ownerId,
              objectToCreate.uniqueId,
              objectToCreate.networkId,
              objectToCreate.parameters
            )
          }
        }
        syncNetworkObjectsTest(worldState.createObjects)

        for (const editObject of worldState.editObjects) {
          NetworkObjectUpdateMap.get(editObject.type)(editObject)
        }

        // Game Manager Messages, must be after create object functions
        if (worldState.gameState && worldState.gameState.length > 0) {
          //console.warn('get state')
          for (const stateMessage of worldState.gameState) {
            if (Network.instance.userId === stateMessage.ownerId) {
              console.log('get message', stateMessage)
              applyStateToClient(stateMessage)
            }
          }
        }
        if (worldState.gameStateActions && worldState.gameStateActions.length > 0) {
          //console.warn('get action')
          for (const actionMessage of worldState.gameStateActions) {
            applyActionComponent(actionMessage)
          }
        }

        // Handle all network objects destroyed this frame
        for (const { networkId } of worldState.destroyObjects) {
          console.log('Destroying ', networkId)
          if (Network.instance.networkObjects[networkId] === undefined) {
            console.warn("Can't destroy object as it doesn't appear to exist")
            continue
          }

          if (Network.instance.localAvatarNetworkId === networkId) {
            console.warn('Can not remove owner...')
            continue
          }
          const entity = Network.instance.networkObjects[networkId].component.entity
          // Remove the entity and all of it's components
          removeEntity(entity)
          // Remove network object from list
          delete Network.instance.networkObjects[networkId]
        }
      } catch (e) {
        console.log(e)
      }
    }

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
          // do our reverse manipulations back from network
          // TODO: minimise quaternions to 3 components
          for (const transform of transformState.transforms) {
            const networkObject = Network.instance.networkObjects[transform.networkId]
            // for character entities, we are sending the view vector, so we have to apply it and retrieve the rotation
            if (
              networkObject &&
              networkObject.component &&
              hasComponent(networkObject.component.entity, AvatarComponent)
            ) {
              vector3_0.set(transform.qX, transform.qY, transform.qZ)
              vector3_1.copy(vector3_0).setY(0).normalize()
              quat.setFromUnitVectors(forwardVector, applyVectorMatrixXZ(vector3_1, forwardVector).setY(0))
              // we don't want to override our own avatar
              if (networkObject.component.entity !== Network.instance.localClientEntity) {
                const avatar = getMutableComponent(networkObject.component.entity, AvatarComponent)
                avatar.viewVector.copy(vector3_0)
              }
              // put the transform rotation on the transform to deal with later
              transform.qX = quat.x
              transform.qY = quat.y
              transform.qZ = quat.z
              transform.qW = quat.w
            }
          }

          const myPlayerTime = transformState.transforms.find(
            (v) => v.networkId == Network.instance.localAvatarNetworkId
          )
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
          const entity = Network.instance.networkObjects[ikTransform.networkId].component.entity
          // ignore our own transform
          if (entity === Network.instance.localClientEntity) continue
          if (!hasComponent(entity, XRInputSourceComponent)) {
            addComponent(entity, XRInputSourceComponent)
          }
          const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
          const { hmd, left, right } = ikTransform
          xrInputSourceComponent.head.position.set(hmd.x, hmd.y, hmd.z)
          xrInputSourceComponent.head.quaternion.set(hmd.qX, hmd.qY, hmd.qZ, hmd.qW)
          xrInputSourceComponent.controllerLeft.position.set(left.x, left.y, left.z)
          xrInputSourceComponent.controllerLeft.quaternion.set(left.qX, left.qY, left.qZ, left.qW)
          xrInputSourceComponent.controllerRight.position.set(right.x, right.y, right.z)
          xrInputSourceComponent.controllerRight.quaternion.set(right.qX, right.qY, right.qZ, right.qW)
        }
      } catch (e) {
        console.log(e)
      }
    }

    function getClientGameActions() {
      let copy = []
      if (Network.instance.clientGameAction.length > 0) {
        copy = Network.instance.clientGameAction
        Network.instance.clientGameAction = []
      }
      return copy
    }

    const inputSnapshot = Vault.instance?.get()
    if (inputSnapshot !== undefined) {
      const buffer = ClientInputModel.toBuffer(Network.instance.clientInputState)
      Network.instance.transport.sendReliableData(buffer)
      Network.instance.clientInputState = {
        networkId: Network.instance.localAvatarNetworkId,
        snapShotTime: inputSnapshot.time - Network.instance.timeSnaphotCorrection ?? 0,
        buttons: [],
        axes1d: [],
        axes2d: [],
        axes6DOF: [],
        viewVector: Network.instance.clientInputState.viewVector,
        clientGameAction: getClientGameActions(), // Network.instance.clientGameAction,
        commands: []
      }
    }
  }

  /** Queries for the system. */
  static queries: any = {}
}
