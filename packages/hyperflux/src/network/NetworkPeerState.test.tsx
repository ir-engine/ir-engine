/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { afterEach, assert, beforeEach, describe, it } from 'vitest'

import {
  applyIncomingActions,
  createHyperStore,
  dispatchAction,
  getMutableState,
  getState,
  HyperFlux,
  NetworkID,
  PeerID,
  stopAllReactors,
  UserID
} from '@ir-engine/hyperflux'

import { joinNetwork, NetworkTopics } from './NetworkState'

import './NetworkPeerState'

import { NetworkActions, NetworkPeerState } from './NetworkPeerState'
import { NetworkState } from './NetworkState'

describe('NetworkPeerState', () => {
  let agentID: UserID

  beforeEach(async () => {
    createHyperStore({ getAgentID: () => agentID })
  })

  afterEach(() => {
    stopAllReactors()
  })

  describe('peer can join', () => {
    it('should add peer to state', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      assert.ok(state)
      assert.equal(state.peers[hostPeerID].peerID, hostPeerID)
      assert.equal(state.peerIndexToPeerID[0], hostPeerID)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], 0)
      assert.equal(state.users[hostUserID].length, 1)
      assert.equal(state.users[hostUserID][0], hostPeerID)
    })

    it('should add multiple peers to state', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      const peerUserID = 'user 2' as UserID
      const peerPeerID = 'user 2 peer' as PeerID

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerPeerID,
          peerIndex: 1,
          userID: peerUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID].peerID, hostPeerID)
      assert.equal(state.peerIndexToPeerID[0], hostPeerID)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], 0)
      assert.equal(state.users[hostUserID].length, 1)
      assert.equal(state.users[hostUserID][0], hostPeerID)

      assert.equal(state.peers[peerPeerID].peerID, peerPeerID)
      assert.equal(state.peerIndexToPeerID[1], peerPeerID)
      assert.equal(state.peerIDToPeerIndex[peerPeerID], 1)
      assert.equal(state.users[peerUserID].length, 1)
      assert.equal(state.users[peerUserID][0], peerPeerID)
    })

    it('should add multiple peers to state with same user', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      const peerPeerID = 'peer 2' as PeerID

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerPeerID,
          peerIndex: 1,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID].peerID, hostPeerID)
      assert.equal(state.peerIndexToPeerID[0], hostPeerID)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], 0)
      assert.equal(state.users[hostUserID].length, 2)
      assert.equal(state.users[hostUserID][0], hostPeerID)
      assert.equal(state.users[hostUserID][1], peerPeerID)

      assert.equal(state.peers[peerPeerID].peerID, peerPeerID)
      assert.equal(state.peerIndexToPeerID[1], peerPeerID)
      assert.equal(state.peerIDToPeerIndex[peerPeerID], 1)
    })

    it('should remove peer', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      dispatchAction(
        NetworkActions.peerLeft({
          peerID: hostPeerID,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID], undefined)
      assert.equal(state.peerIndexToPeerID[0], undefined)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], undefined)
      assert.equal(state.users[hostUserID], undefined)
    })

    it('should not remove user when a peer leaves but another remains', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      const peerUserID = 'peer user' as UserID
      const peerPeerID = 'peer peer' as PeerID

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerPeerID,
          peerIndex: 1,
          userID: peerUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      dispatchAction(
        NetworkActions.peerLeft({
          peerID: hostPeerID,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID], undefined)
      assert.equal(state.peerIndexToPeerID[0], undefined)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], undefined)
      assert.equal(state.users[hostUserID], undefined)
      assert.equal(state.users[peerUserID].length, 1)
      assert.equal(state.users[peerUserID][0], peerPeerID)
    })
  })
})
