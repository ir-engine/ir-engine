import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { PartyActions, PartyServiceReceptors } from '../../social/services/PartyService'

export default async function PartySystem() {
  const loadedPartyQueue = createActionQueue(PartyActions.loadedPartyAction.matches)
  const createdPartyQueue = createActionQueue(PartyActions.createdPartyAction.matches)
  const removedPartyQueue = createActionQueue(PartyActions.removedPartyAction.matches)
  const invitedPartyUserQueue = createActionQueue(PartyActions.invitedPartyUserAction.matches)
  const createdPartyUserQueue = createActionQueue(PartyActions.createdPartyUserAction.matches)
  const patchedPartyUserQueue = createActionQueue(PartyActions.patchedPartyUserAction.matches)
  const removedPartyUserQueue = createActionQueue(PartyActions.removedPartyUserAction.matches)
  const changedPartyActionQueue = createActionQueue(PartyActions.changedPartyAction.matches)
  const resetUpdateNeededActionQueue = createActionQueue(PartyActions.resetUpdateNeededAction.matches)

  const execute = () => {
    for (const action of loadedPartyQueue()) PartyServiceReceptors.loadedPartyReceptor(action)
    for (const action of createdPartyQueue()) PartyServiceReceptors.createdPartyReceptor(action)
    for (const action of removedPartyQueue()) PartyServiceReceptors.removedPartyReceptor(action)
    for (const action of invitedPartyUserQueue()) PartyServiceReceptors.invitedPartyUserReceptor(action)
    for (const action of createdPartyUserQueue()) PartyServiceReceptors.createdPartyUserReceptor(action)
    for (const action of patchedPartyUserQueue()) PartyServiceReceptors.patchedPartyUserReceptor(action)
    for (const action of removedPartyUserQueue()) PartyServiceReceptors.removedPartyUserReceptor(action)
    for (const action of changedPartyActionQueue()) PartyServiceReceptors.changedPartyReceptor(action)
    for (const action of resetUpdateNeededActionQueue()) PartyServiceReceptors.resetUpdateNeededReceptor(action)
  }

  const cleanup = async () => {
    removeActionQueue(loadedPartyQueue)
    removeActionQueue(createdPartyQueue)
    removeActionQueue(removedPartyQueue)
    removeActionQueue(invitedPartyUserQueue)
    removeActionQueue(createdPartyUserQueue)
    removeActionQueue(patchedPartyUserQueue)
    removeActionQueue(removedPartyUserQueue)
    removeActionQueue(changedPartyActionQueue)
    removeActionQueue(resetUpdateNeededActionQueue)
  }

  return { execute, cleanup }
}
