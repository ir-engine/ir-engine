export const state = function () {
    return {
        cursorActive: true,
        rightHandControllerActive: false,
        avatars: [],
        avatarURLs: {},
        playerHeight: 1.6
    };
};

export const mutations = {
    SET_CURSOR_ACTIVE: function(state, active=true) {
        if (CONFIG.DEBUG) {console.log("SET_CURSOR_ACTIVE")}
        state.cursorActive = active;
    },
    SET_RIGHT_HAND_CONTROLLER_ACTIVE: function(state, active=true) {
        if (CONFIG.DEBUG) {console.log("SET_RIGHT_HAND_CONTROLLER_ACTIVE")}
        state.rightHandControllerActive = active;
    },
    SET_AVATARS: function(state, objs) {
        if (CONFIG.DEBUG) {console.log('SET_AVATARS');}
        state.avatars = objs;
    },
    ADD_AVATARURL: function(state, payload) {
        Vue.set(state.avatarURLs, payload.key, payload.url);
    }
};

export const getters = {
    getAvatarURL: (state) => (key) => {
        return state.avatarURLs[ key ];
    }
};

export const actions = {
    getAvatars ({ commit }) {
    },
};

const avatarModule = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};

export default avatarModule;
