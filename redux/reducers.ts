import { combineReducers } from 'redux-immutable';
import authReducer from './auth/reducers';
import videoReducer from "./video/reducers";

export default combineReducers({
    auth: authReducer,
    videos: videoReducer
});