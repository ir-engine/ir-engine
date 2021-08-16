import { createStore, applyMiddleware } from 'redux'
import { saveAuthState } from './persisted.store'
import thunkMiddleware from 'redux-thunk'
import Immutable from 'immutable'
import { composeWithDevTools } from 'redux-devtools-extension'

const initialState: any = Immutable.Map()
const middleware = applyMiddleware(thunkMiddleware)

export function configureStore(reducers) {
  Store.store = createStore(
    reducers,
    initialState,
    // if not production, enable redux dev tools.
    process.env.NODE_ENV === 'production' ? middleware : composeWithDevTools(middleware)
  )
  ;(window as any).store = Store.store // Exposing the store to window to make it intentionally available to bots and clients and whatnot
  // add a listener that will be invoked on any state change.
  Store.store.subscribe(() => {
    saveAuthState(Store.store.getState())
  })

  return Store.store
}

export default class Store {
  static store
}
