import channelConnectionoReducer from './channelConnection/reducers';
import instanceConnectionoReducer from './instanceConnection/reducers';
import locationReducer from './location/reducers';
import transportReducer from './transport/reducers';

export default {
  channelConnection: channelConnectionoReducer,
  instanceConnection: instanceConnectionoReducer,
  locations: locationReducer,
  transport: transportReducer
};
