import AcceptInvite from '../user/accept-invite/accept-invite.service';
import Auth from './auth-management/auth-management.service';
import IdentityProvider from './identity-provider/identity-provider.service';
import LoginToken from './login-token/login-token.service';
import Login from './login/login.service';
import MagicLink from './magic-link/magic-link.service';
import Notifications from './notifications/notifications.service';
import UserRole from './user-role/user-role.service';
import UserSettings from './user-settings/user-settings.service';
import User from './user/user.service';

export default [
  UserRole,
  User,
  UserSettings,
  Notifications,
  IdentityProvider,
  LoginToken,
  AcceptInvite,
  Auth,
  Login,
  MagicLink
]
