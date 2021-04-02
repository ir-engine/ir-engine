import { combineReducers } from 'redux-immutable';
import channelConnectionReducer from './channelConnection/reducers';
import instanceConnectionReducer from './instanceConnection/reducers';
import partyReducer from './party/reducers';

export default combineReducers({
  party: partyReducer,
  channelConnection: channelConnectionReducer,
  instanceConnection: instanceConnectionReducer,
});
