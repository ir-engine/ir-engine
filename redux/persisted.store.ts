import Immutable from 'immutable';
// import { initialState as authState } from './auth/reducers';

// const initialState: any = Immutable.fromJS({
//     auth: {}
// });
const initialState: any = Immutable.Map();

const STORAGE_KEY = 'xrchat-client-store-key-v1';
export const persistedStore = (() => {
    try {
        const rawState = localStorage.getItem(STORAGE_KEY);
        if (!rawState) {
            return initialState;
        }
        
        const state = JSON.parse(rawState);
        return Immutable.fromJS(state);
    } catch (err) {
        return initialState;
    }
})();

export const saveState = (state: any) => {
    try {
        const rawState = JSON.stringify(state);
        console.log('savestate----------', rawState);

        localStorage.setItem(STORAGE_KEY, rawState);
    } catch (err) {
        // nothing to do.
    }
};