import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { PartyActionType } from './PartyActions'

import { PartyUser } from '@xrengine/common/src/interfaces/PartyUser'
import _ from 'lodash'
import { Party } from '@xrengine/common/src/interfaces/Party'
import { store } from '../../store'

const state = createState({
  party: {} as Party,
  updateNeeded: true
})

store.receptors.push((action: PartyActionType): any => {
  let newValues, updateMap, partyUser, updateMapPartyUsers

  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_PARTY':
        return s.merge({ party: action.party, updateNeeded: false })
      case 'CREATED_PARTY':
        return s.updateNeeded.set(true)
      case 'REMOVED_PARTY':
        updateMap = new Map()
        return s.merge({ party: {}, updateNeeded: true })
      case 'INVITED_PARTY_USER':
        return s.updateNeeded.set(true)
      case 'CREATED_PARTY_USER':
        newValues = action
        partyUser = newValues.partyUser
        updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMapPartyUsers = updateMap.partyUsers
          updateMapPartyUsers = Array.isArray(updateMapPartyUsers)
            ? updateMapPartyUsers.find((pUser) => {
                return pUser != null && pUser.id === partyUser.id
              }) == null
              ? updateMapPartyUsers.concat([partyUser])
              : updateMap.partyUsers.map((pUser) => {
                  return pUser != null && pUser.id === partyUser.id ? partyUser : pUser
                })
            : [partyUser]
          updateMap.partyUsers = updateMapPartyUsers
        }
        return s.party.set(updateMap)

      case 'PATCHED_PARTY_USER':
        newValues = action
        partyUser = newValues.partyUser
        updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMapPartyUsers = updateMap.partyUsers
          updateMapPartyUsers = Array.isArray(updateMapPartyUsers)
            ? updateMapPartyUsers.find((pUser) => {
                return pUser != null && pUser.id === partyUser.id
              }) == null
              ? updateMapPartyUsers.concat([partyUser])
              : updateMap.partyUsers.map((pUser) => {
                  return pUser != null && pUser.id === partyUser.id ? partyUser : pUser
                })
            : [partyUser]
          updateMap.partyUsers = updateMapPartyUsers
        }
        return s.party.set(updateMap)

      case 'REMOVED_PARTY_USER':
        newValues = action
        partyUser = newValues.partyUser
        updateMap = _.cloneDeep(s.party.value)
        if (updateMap != null) {
          updateMapPartyUsers = updateMap.partyUsers
          _.remove(updateMapPartyUsers, (pUser: PartyUser) => {
            return pUser != null && partyUser.id === pUser.id
          })
        }
        s.party.set(updateMap)
        return s.updateNeeded.set(true)
    }
  }, action.type)
})

export const accessPartyState = () => state

export const usePartyState = () => useState(state) as any as typeof state
