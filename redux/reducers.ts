import { combineReducers } from 'redux-immutable';
import authReducer from './auth/reducers';

export default combineReducers({
    auth: authReducer
});