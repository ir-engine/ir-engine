export const state = function () {
    return {
        messages: []
    };
};

export const mutations = {
    // payload: fromClientId, dataType, data, source
    MESSAGE_RECEIVED: (state, payload) => state.messages.push({playerName: payload.fromClientId, msg: payload.data}),
    // payload: clientId, data
    MESSAGE_SENT: (state, payload) => state.messages.push({playerName: payload.clientId, msg: payload.data}),
};

const chatModule = {
    namespaced: true,
    state,
    mutations
}

export default chatModule;
