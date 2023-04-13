import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { createActionQueue, getMutableState, none, removeActionQueue } from '@etherealengine/hyperflux'

import { isClient } from '../common/functions/isClient'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { NetworkState } from '../networking/NetworkState'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'
import { spawnAvatarReceptor } from './functions/spawnAvatarReceptor'
import { IKSerialization } from './IKSerialization'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export function getRandomSpawnPoint(userId: UserId): { position: Vector3; rotation: Quaternion } {
  const spawnPoints = spawnPointQuery()
  const spawnPointForUser = spawnPoints.find((entity) =>
    getComponent(entity, SpawnPointComponent).permissionedUsers.includes(userId)
  )
  const entity = spawnPointForUser ?? spawnPoints[Math.round(Math.random() * (spawnPoints.length - 1))]
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    return {
      position: spawnTransform.position
        .clone()
        .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
      rotation: spawnTransform.rotation.clone()
    }
  }

  console.warn("Couldn't spawn entity at spawn point, no spawn points available")

  return {
    position: randomPositionCentered(new Vector3(2, 0, 2)),
    rotation: new Quaternion()
  }
}

export function getSpawnPoint(spawnPointNodeId: string, userId: UserId): { position: Vector3; rotation: Quaternion } {
  const entity = UUIDComponent.entitiesByUUID[spawnPointNodeId].value
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const spawnComponent = getComponent(entity, SpawnPointComponent)
    if (!spawnComponent.permissionedUsers.length || spawnComponent.permissionedUsers.includes(userId)) {
      return {
        position: spawnTransform.position
          .clone()
          .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
        rotation: spawnTransform.rotation.clone()
      }
    }
  }
  return getRandomSpawnPoint(userId)
}

export function avatarDetailsReceptor(action: ReturnType<typeof WorldNetworkAction.avatarDetails>) {
  const userAvatarDetails = getMutableState(WorldState).userAvatarDetails
  userAvatarDetails[action.uuid].set(action.avatarDetail)
  if (isClient && action.avatarDetail.avatarURL) {
    const entity = UUIDComponent.entitiesByUUID.value[action.uuid]
    loadAvatarForUser(entity, action.avatarDetail.avatarURL)
  }
}

const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])

const avatarSpawnQueue = createActionQueue(WorldNetworkAction.spawnAvatar.matches)
const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)

const execute = () => {
  for (const action of avatarSpawnQueue()) spawnAvatarReceptor(action)
  for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)

  // Keep a list of spawn points so we can send our user to one
  for (const entity of spawnPointQuery.enter()) {
    if (!hasComponent(entity, TransformComponent)) {
      console.warn("Can't add spawn point, no transform component on entity")
      continue
    }
  }
}

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[IKSerialization.headID].set({
      read: IKSerialization.readXRHead,
      write: IKSerialization.writeXRHead
    })

    networkState.networkSchema[IKSerialization.leftHandID].set({
      read: IKSerialization.readXRLeftHand,
      write: IKSerialization.writeXRLeftHand
    })

    networkState.networkSchema[IKSerialization.rightHandID].set({
      read: IKSerialization.readXRRightHand,
      write: IKSerialization.writeXRRightHand
    })

    return () => {
      removeQuery(spawnPointQuery)
      removeActionQueue(avatarSpawnQueue)
      removeActionQueue(avatarDetailsQueue)

      networkState.networkSchema[IKSerialization.headID].set(none)
      networkState.networkSchema[IKSerialization.leftHandID].set(none)
      networkState.networkSchema[IKSerialization.rightHandID].set(none)
    }
  }, [])
  return null
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'ee.engine.AvatarSpawnSystem',
  execute,
  reactor
})
