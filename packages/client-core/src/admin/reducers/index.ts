import adminReducer from './admin/reducers';
import adminUserReducer from "./admin/user/reducers";
import contentPackReducer from './contentPack/reducers';

export default {
  adminUser: adminUserReducer,
  admin: adminReducer,
  contentPack: contentPackReducer
};
