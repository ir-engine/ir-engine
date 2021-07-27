import authReducer from './auth/reducers'
import { userReducer } from '../store/UserState'
export default {
  auth: authReducer,
  user: userReducer
}
