// Objects
import IdentityProvider from './identity-provider/identity-provider.service';
import LoginToken from './login-token/login-token.service';

// Services
import AcceptInvite from './accept-invite/accept-invite.service';
import Auth from './auth-management/auth-management.service';
import Login from './login/login.service';
import MagicLink from './magic-link/magic-link.service';

export default [
  IdentityProvider,
  LoginToken,
  AcceptInvite,
  Auth,
  Login,
  MagicLink
]
