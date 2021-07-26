import authReducer from './auth/reducers'
import { userReceptor } from '../store/UserState'
export default {
  auth: authReducer,
  user: userReceptor
}
