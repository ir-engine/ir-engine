import { InstanceID, UserID } from '@etherealengine/common/src/schema.type.module'
import { defineState, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { SimulationSystemGroup } from '../ecs/functions/SystemGroups'
import { NetworkState } from './NetworkState'
import { NetworkTopics } from './classes/Network'

/**
 * NetworkUserState is a state that tracks which users are in which instances
 */
export const NetworkUserState = defineState({
  name: 'ee.engine.network.NetworkUserState',
  initial: {} as Record<UserID, InstanceID[]>,

  userJoined: (userID: UserID, instanceID: InstanceID) => {
    if (!getState(NetworkUserState)[userID]) getMutableState(NetworkUserState)[userID].set([])
    if (!getState(NetworkUserState)[userID].includes(instanceID))
      getMutableState(NetworkUserState)[userID].merge([instanceID])
  },

  userLeft: (userID: UserID, instanceID: InstanceID) => {
    getMutableState(NetworkUserState)[userID].set((ids) => ids.filter((id) => id !== instanceID))
    if (getState(NetworkUserState)[userID].length === 0) getMutableState(NetworkUserState)[userID].set(none)
  }
})

const NetworkUserReactor = (props: { networkID: InstanceID; userID: UserID }) => {
  useEffect(() => {
    NetworkUserState.userJoined(props.userID, props.networkID)
    return () => NetworkUserState.userLeft(props.userID, props.networkID)
  }, [])
  return null
}

const NetworkReactor = (props: { networkID: InstanceID }) => {
  const networkUsers = useHookstate(getMutableState(NetworkState).networks[props.networkID].users)

  return (
    <>
      {networkUsers.keys.map((userID: UserID) => (
        <NetworkUserReactor networkID={props.networkID} userID={userID} key={userID} />
      ))}
    </>
  )
}

const reactor = () => {
  const worldNetworkIDs = Object.entries(useHookstate(getMutableState(NetworkState).networks).value)
    .filter(([id, network]) => network.topic === NetworkTopics.world)
    .map(([id]) => id as InstanceID)
  return (
    <>
      {worldNetworkIDs.map((networkID) => (
        <NetworkReactor networkID={networkID} key={networkID} />
      ))}
    </>
  )
}

export const NetworkUserStateSystem = defineSystem({
  uuid: 'ee.networking.NetworkUserStateSystem',
  reactor,
  insert: { with: SimulationSystemGroup }
})
