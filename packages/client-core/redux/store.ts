import { createStore, applyMiddleware } from 'redux';
import { saveState } from './persisted.store';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';
import Immutable from 'immutable';
import { composeWithDevTools } from 'redux-devtools-extension';

const initialState: any = Immutable.Map();
const middleware = applyMiddleware(thunkMiddleware);
const store = createStore(
  reducers,
  initialState,
  // if not production, enable redux dev tools.
  process.env.NODE_ENV === 'production' ? middleware : composeWithDevTools(middleware)
);

export function configureStore() {
  // add a listener that will be invoked on any state change.
  store.subscribe(() => {
    saveState(store.getState());
  });

  return store;
}

export default store;
