import Immutable from 'immutable';
import { localStorageKey } from '../config/server';
// import { initialState as authState } from './auth/reducers';

// const initialState: any = Immutable.fromJS({
//     auth: {}
// });
const initialState: any = Immutable.Map();

export const persistedStore = (() => {
    try {
        const rawState = localStorage.getItem(localStorageKey);
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

        localStorage.setItem(localStorageKey, rawState);
    } catch (err) {
        // nothing to do.
    }
};