import { createActionQueue } from "@xrengine/hyperflux";

import { PartyActions, PartyServiceReceptors } from "../../social/services/PartyService";

export default async function PartySystem() {
    const loadedPartyQueue = createActionQueue(PartyActions.loadedPartyAction.matches)
    const createdPartyQueue = createActionQueue(PartyActions.createdPartyAction.matches)
    const removedPartyQueue = createActionQueue(PartyActions.removedPartyAction.matches)
    const invitedPartyUserQueue = createActionQueue(PartyActions.invitedPartyUserAction.matches)
    const createdPartyUserQueue = createActionQueue(PartyActions.createdPartyUserAction.matches)
    const patchedPartyUserQueue = createActionQueue(PartyActions.patchedPartyUserAction.matches)
    const removedPartyUserQueue = createActionQueue(PartyActions.removedPartyUserAction.matches)

    return () => {
        for (const action of loadedPartyQueue()) {
            console.log('loadedPartyQueue popping', action)
            PartyServiceReceptors.loadedPartyReceptor(action)
        }
        for (const action of createdPartyQueue()) {
            console.log('createdPartyQueue popping')
            PartyServiceReceptors.createdPartyReceptor(action)
        }
        for (const action of removedPartyQueue()) {
            PartyServiceReceptors.removedPartyReceptor(action)
        }
        for (const action of invitedPartyUserQueue()) {
            PartyServiceReceptors.invitedPartyUserReceptor(action)
        }
        for (const action of createdPartyUserQueue()) {
            PartyServiceReceptors.createdPartyUserReceptor(action)
        }
        for (const action of patchedPartyUserQueue()) {
            PartyServiceReceptors.patchedPartyUserReceptor(action)
        }
        for (const action of removedPartyUserQueue()) {
            PartyServiceReceptors.removedPartyUserReceptor(action)
        }
    }
}