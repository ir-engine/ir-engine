import { createStore, applyMiddleware } from "redux";
import { persistedStore, saveState } from "./persisted.store";
import thunk from 'redux-thunk'
import reducers from "./reducers";

export function configureStore() {
    const store = createStore(
        reducers,
        persistedStore,
        applyMiddleware(thunk)
    );

    // add a listener that will be invoked on any state change.
    store.subscribe(() => {
        saveState(store.getState());
    });

    return store;
}
