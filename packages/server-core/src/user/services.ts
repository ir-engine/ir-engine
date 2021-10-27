import AcceptInvite from '../user/accept-invite/accept-invite.service'
import Auth from './auth-management/auth-management.service'
import Email from './email/email.service'
import IdentityProvider from './identity-provider/identity-provider.service'
import Login from './login/login.service'
import LoginToken from './login-token/login-token.service'
import MagicLink from './magic-link/magic-link.service'
import SMS from './sms/sms.service'
import User from './user/user.service'
import UserRelationship from './user-relationship/user-relationship.service'
import UserRelationshipType from './user-relationship-type/user-relationship-type.service'
import UserRole from './user-role/user-role.service'
import UserSettings from './user-settings/user-settings.service'
import UserInventory from './user-inventory/user-inventory.service'


export default [
  UserRole,
  User,
  UserSettings,
  IdentityProvider,
  UserRelationshipType,
  UserRelationship,
  UserInventory,
  AcceptInvite,
  Auth,
  Login,
  LoginToken,
  MagicLink,
  Email,
  SMS
]
