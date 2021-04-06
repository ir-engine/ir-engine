import AcceptInvite from '../user/accept-invite/accept-invite.service';
import Auth from './auth-management/auth-management.service';
import IdentityProvider from './identity-provider/identity-provider.service';
import LoginToken from './login-token/login-token.service';
import Login from './login/login.service';
import MagicLink from './magic-link/magic-link.service';
import UserRole from './user-role/user-role.service';
import UserSettings from './user-settings/user-settings.service';
import User from './user/user.service';
import UserRelationshipType from './user-relationship-type/user-relationship-type.service';
import UserRelationship from './user-relationship/user-relationship.service';
export default [
  UserRole,
  UserSettings,
  UserRelationshipType,
  UserRelationship,
  IdentityProvider,
  AcceptInvite,
  Auth,
  Login,
  LoginToken,
  MagicLink,
  User,
];
