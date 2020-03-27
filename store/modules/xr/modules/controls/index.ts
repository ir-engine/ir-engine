export const state = () => 
    {
        return {
            cursorActive: true,
            rightHandControllerActive: false,
            raycasterTargets: ['.clickable', '.a-enter-vr'],
        }
    }

export const mutations = {
    SET_CURSOR_ACTIVE: (state: any, active=true) => state.cursorActive = active,
    SET_RIGHT_HAND_CONTROLLER_ACTIVE: (state: any, active=true) => state.rightHandControllerActive = active,
}

export const getters = {
    raycasterTargetsString: (state: any) => (key: any) => state.raycasterTargets.join(',')
}

const controlsModule = {
    namespaced: true,
    state,
    mutations,
}

export default controlsModule
