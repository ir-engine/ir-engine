export const state = function () {
    return {
        cursorActive: true,
        rightHandControllerActive: false,
        raycasterTargets: ['.clickable', '.a-enter-vr'],
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
};

export const getters = {
    raycasterTargetsString: (state) => (key) => {
        return state.raycasterTargets.join(',');
    }
};

const controlsModule = {
    namespaced: true,
    state,
    // getters,
    mutations,
    // actions
};

export default controlsModule;
