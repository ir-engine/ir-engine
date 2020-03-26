import avatarModule from './modules/avatar/index.js';
import chatModule from './modules/chat/index.js';
import controlsModule from './modules/controls/index.js';
import nafModule from './modules/naf/index.js';
import styleModule from './modules/style/index.js';


export const modules = {
        avatar: avatarModule,
        chat: chatModule,
        controls: controlsModule,
        naf: nafModule,
        style: styleModule,
};

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
};

export const getters = {
    ROOM_SOURCE: (state, getters, rootState, rootGetters) => (key) => state.roomSources[ key ],
    CURRENT_ROOM_SOURCE: (state, getters, rootState, rootGetters) => state.roomSources[ state.roomName ]
};

export const mutations = {
        SET_IN_VR: (state, active=true) => state.inVR = active,
        SET_ROOMS: (state, rooms) => state.rooms = rooms,
        ADD_ROOM: (state, room) => state.rooms.push(room),
        SET_ROOMCONFIG: (state, roomConfig) => state.roomConfig = roomConfig,
        SET_ROOMNAME: (state, name) => state.roomName = name,
        ADD_ROOM_SOURCE: (state, payload) => Vue.set(state.roomSources, payload.key, payload.src),
        SET_SCENELOADED: (state) => state.sceneLoaded = AFRAME.scenes == undefined ? false : AFRAME.scenes[0].hasLoaded,
        SET_ISMOBILE: (state) => state.isMobile = AFRAME.utils.device.isMobile(),
};

export const actions = {
        setRoomName (context, name) {
            context.commit('SET_ROOMNAME', name);
        }
};

const xrModule = {
    namespaced: true,
    modules,
    state,
    getters,
    mutations,
    actions
};

export default xrModule;
