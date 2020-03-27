import avatarModule from './modules/avatar/index.js'
import chatModule from './modules/chat/index.js'
import controlsModule from './modules/controls/index.js'
import nafModule from './modules/naf/index.js'
import styleModule from './modules/style/index.js'

import Vue from 'vue'

export const modules = {
    avatar: avatarModule,
    chat: chatModule,
    controls: controlsModule,
    naf: nafModule,
    style: styleModule,
}

export const state = function () {
    return {
        roomConfig: {},
        roomName: 'xrchat',
        rooms: [],
        roomSources: {},
        sceneLoaded: false,
        isMobile: false,
        inVR: false,
    }
}

export const getters = {
    ROOM_SOURCE: (state : any, getters : any, rootState : any, rootGetters : any) => (key : any) => state.roomSources[key],
    CURRENT_ROOM_SOURCE: (state : any, getters : any, rootState : any, rootGetters : any) => state.roomSources[state.roomName]
}

export const mutations = {
    SET_IN_VR: (state : any, active = true) => state.inVR = active,
    SET_ROOMS: (state : any, rooms : any) => state.rooms = rooms,
    ADD_ROOM: (state : any, room : any) => state.rooms.push(room),
    SET_ROOMCONFIG: (state : any, roomConfig : any) => state.roomConfig = roomConfig,
    SET_ROOMNAME: (state : any, name : any) => state.roomName = name,
    ADD_ROOM_SOURCE: (state : any, payload : any) => Vue.set(state.roomSources, payload.key, payload.src),
    SET_SCENELOADED: (state : any) => state.sceneLoaded = AFRAME.scenes == undefined ? false : AFRAME.scenes[0].hasLoaded,
    SET_ISMOBILE: (state : any) => state.isMobile = AFRAME.utils.device.isMobile(),
}

export const actions = {
    setRoomName(context : any, name : any) {
        context.commit('SET_ROOMNAME', name)
    }
}

const xrModule = {
    namespaced: true,
    modules,
    state,
    getters,
    mutations,
    actions
}

export default xrModule
