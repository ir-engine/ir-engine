import { createStore, applyMiddleware } from "redux";
import { persistedStore } from "./persisted.store";
import thunkMiddleware from 'redux-thunk'
import reducers from "./reducers";

export function configureStore() {
    const store = createStore(
        reducers,
        persistedStore,
        applyMiddleware(thunkMiddleware)
    );

    // add a listener that will be invoked on any state change.
    store.subscribe(() => {
        // saveState(store.getState());
    });

    return store;
}
