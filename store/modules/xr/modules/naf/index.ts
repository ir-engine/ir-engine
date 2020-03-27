export const state = () => {
    return {
        numberOfPlayers: 0,
        playerNames: new Map(),
        updateNames: 1,
        connectOnLoad: true
    }
}

export const mutations = {
    INCREMENT_PLAYERS: (state: any) => state.numberOfPlayers += 1,
    DECREMENT_PLAYERS: (state: any) => state.numberOfPlayers = state.numberOfPlayers > 0 ?
                                    state.numberOfPlayers - 1 : state.numberOfPlayers,
    // payload: clientId, name
    CHANGE_PLAYER_NAME: (state: any, payload: any) => {
        // only set name to clientId if it isn't already in map
        if ( (payload.clientId != payload.name) ||
            (payload.clientId == payload.name && !state.playerNames.has(payload.clientId))) {
                state.playerNames.set(payload.clientId, payload.name)
                state.updateNames += 1
        }
    },
    SET_CONNECT_ON_LOAD: (state: any, bool=true) => state.connectOnLoad = true,
}


export const actions = {
    addPlayer: (context: any, payload: any) => {
        context.commit('INCREMENT_PLAYERS')
        context.state.playerNames.set(payload.clientId, payload.name)
    },
    // payload: clientId
    removePlayer: (context: any, payload: any) => context.commit('DECREMENT_PLAYERS')
}

const nafModule = {
    namespaced: true,
    state,
    mutations,
    actions
}

export default nafModule
