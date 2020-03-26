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
    ROOM_SOURCE: (state, getters, rootState, rootGetters) => (key) => {
            return state.roomSources[ key ];
    },
    CURRENT_ROOM_SOURCE: (state, getters, rootState, rootGetters) => {
        return state.roomSources[ state.roomName ];
    }
};

export const mutations = {
        SET_IN_VR: function(state, active=true) {
            if (CONFIG.DEBUG) {console.log("SET_IN_VR")}
            state.inVR = active;
        },
        SET_ROOMS: function(state, rooms) {
            if (CONFIG.DEBUG) {console.log('SET_ROOMS');}
            state.rooms = rooms;
        },
        ADD_ROOM: function(state, room) {
            if (CONFIG.DEBUG) {console.log('ADD_ROOM');}
            state.rooms.push(room);
        },
        SET_ROOMCONFIG: function(state, roomConfig) {
            if (CONFIG.DEBUG) {console.log('SET_ROOMCONFIG');}
            state.roomConfig = roomConfig;
        },
        SET_ROOMNAME: function(state, name) {
            if (CONFIG.DEBUG) {console.log('SET_ROOMNAME');}
            state.roomName = name;
        },
        ADD_ROOM_SOURCE: function(state, payload) {
            Vue.set(state.roomSources, payload.key, payload.src);
        },
        SET_SCENELOADED: function(state) {
            if (CONFIG.DEBUG) {console.log('SET_SCENELOADED');}
            if (AFRAME == undefined) {
                state.sceneLoaded = false;
            }
            else {
                var scene = AFRAME.scenes[0];
                state.sceneLoaded = scene == undefined ? false : scene.hasLoaded;
            }
        },
        SET_ISMOBILE: function(state) {
            if (CONFIG.DEBUG) {console.log('SET_ISMOBILE');}
            if (AFRAME == undefined) {
                console.log("Cannto call SET_ISMOBILE before AFRAME is loaded");
            }
            else {
                state.isMobile = AFRAME.utils.device.isMobile();
            }
        },
};
export const actions = {
        setRoomName (context, name) {
            if (CONFIG.DEBUG) {console.log(`setRoomName(${name})`);};
            context.commit('SET_ROOMNAME', name);
        },

        // getRoomConfig ({ commit }) {
        // },

        // getRooms (context) {
        // },
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
