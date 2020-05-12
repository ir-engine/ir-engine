import { createStore, applyMiddleware } from 'redux'
import { saveState } from './persisted.store'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import Immutable from 'immutable'

const initialState: any = Immutable.Map()

export function configureStore () {
  const store = createStore(
    reducers,
    initialState,
    applyMiddleware(thunkMiddleware)
  )

  // add a listener that will be invoked on any state change.
  store.subscribe(() => {
    saveState(store.getState())
  })

  return store
}
