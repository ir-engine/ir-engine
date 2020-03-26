export const state = function () {
    return {
        numberOfPlayers: 0,
        playerNames: new Map(),
        updateNames: 1,
        connectOnLoad: true,
    };
};

export const mutations = {
    INCREMENT_PLAYERS: function(state) {
        if (CONFIG.DEBUG) {console.log("INCREMENT_PLAYERS");}
        state.numberOfPlayers += 1;
    },
    DECREMENT_PLAYERS: function(state) {
        if (CONFIG.DEBUG) {console.log("DECREMENT_PLAYERS");}
        if (state.numberOfPlayers > 0) {
            state.numberOfPlayers -= 1;
        }
    },
    // payload: clientId, name
    CHANGE_PLAYER_NAME: function(state, payload) {
        if (CONFIG.DEBUG) {console.log(`CHANGE_PLAYER_NAME (${payload.clientId}, ${payload.name})`);}
        // only set name to clientId if it isn't already in map
        if ( (payload.clientId != payload.name) ||
            (payload.clientId == payload.name && !state.playerNames.has(payload.clientId))) {
                state.playerNames.set(payload.clientId, payload.name);
                state.updateNames += 1;
        }
    },
    SET_CONNECT_ON_LOAD: function(state, bool=true) {
        if (CONFIG.DEBUG) {console.log("SET_CONNECT_ON_LOAD");}
        state.connectOnLoad = true;
    },
};


export const actions = {
    // payload: clientId, name
    addPlayer: function(context, payload) {
        if (CONFIG.DEBUG) {console.log("addPlayer");}
        context.commit('INCREMENT_PLAYERS');
        context.state.playerNames.set(payload.clientId, payload.name);
    },
    // payload: clientId
    removePlayer: function(context, payload) {
        if (CONFIG.DEBUG) {console.log("removePlayer");}
        context.commit('DECREMENT_PLAYERS');
        // context.state.playerNames.delete(payload.clientId);
    }
};

const nafModule = {
    namespaced: true,
    state,
    mutations,
    actions
}

export default nafModule;
