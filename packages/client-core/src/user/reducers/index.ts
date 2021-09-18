import { authReducer } from './auth/AuthState'
import { userReducer } from '../store/UserState'
export default {
  auth: authReducer,
  user: userReducer
}
