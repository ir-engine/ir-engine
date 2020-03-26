export const state = function () {
    return {
        messages: []
    };
};

export const mutations = {
    // payload: fromClientId, dataType, data, source
    MESSAGE_RECEIVED: function(state, payload) {
        if (CONFIG.DEBUG) {console.log("MESSAGE_RECEIVED");}
        state.messages.push({playerName: payload.fromClientId, msg: payload.data})
    },
    // payload: clientId, data
    MESSAGE_SENT: function(state, payload) {
        if (CONFIG.DEBUG) {console.log("MESSAGE_SENT");}
        state.messages.push({playerName: payload.clientId, msg: payload.data})
    },
};

const chatModule = {
    namespaced: true,
    state,
    mutations
}

export default chatModule;
