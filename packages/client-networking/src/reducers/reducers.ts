import locationReducer from '@xr3ngine/client-core/src/social/reducers/location/reducers';
import channelConnectionoReducer from './channelConnection/reducers';
import instanceConnectionoReducer from './instanceConnection/reducers';
import mediastreamReducer from './mediastream/reducers';
import transportReducer from './transport/reducers';

export default {
  mediastream: mediastreamReducer,
  channelConnection: channelConnectionoReducer,
  instanceConnection: instanceConnectionoReducer,
  locations: locationReducer,
  transport: transportReducer
};
