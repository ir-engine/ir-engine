import Vue from 'vue'

const state = function () {
    return {
        cursorActive: true,
        rightHandControllerActive: false,
        avatars: [],
        avatarURLs: {},
        playerHeight: 1.6
    }
}

const mutations = {
    SET_CURSOR_ACTIVE: (state: any, active=true) => state.cursorActive = active,
    SET_RIGHT_HAND_CONTROLLER_ACTIVE: (state: any, active = true) => state.rightHandControllerActive = active,
    SET_AVATARS: (state: any, objs: any) => state.avatars = objs,
    ADD_AVATARURL: (state: any, payload : any) => Vue.set(state.avatarURLs, payload.key, payload.url)
}

const getters = {
    getAvatarURL: (state: any) => (key: any) =>  state.avatarURLs[ key ]
}

const avatarModule = {
    namespaced: true,
    state,
    getters,
    mutations
}

export default avatarModule
