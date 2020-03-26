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
    SET_CURSOR_ACTIVE: (state, active=true) => state.cursorActive = active,
    SET_RIGHT_HAND_CONTROLLER_ACTIVE: (state, active = true) => state.rightHandControllerActive = active,
    SET_AVATARS: (state, objs) => state.avatars = objs,
    ADD_AVATARURL: (state, payload) => Vue.set(state.avatarURLs, payload.key, payload.url)
}

export const getters = {
    getAvatarURL: (state) => (key) =>  state.avatarURLs[ key ]
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
