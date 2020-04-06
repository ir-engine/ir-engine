import { ApplicationState } from "./store";

const STORAGE_KEY = 'xrchat-client-store-key-v1';
export const persistedStore = (() => {
    try {
        const rawState = localStorage.getItem(STORAGE_KEY);
        if (rawState === null) {
            return undefined;
        }

        const state = JSON.parse(rawState);
        return state;
    } catch (err) {
        return undefined;
    }
})();

export const saveState = (state: ApplicationState) => {
    try {
        const rawState = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, rawState);
    } catch (err) {
        // nothing to do.
    }
};