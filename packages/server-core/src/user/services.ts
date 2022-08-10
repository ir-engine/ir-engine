import AcceptInvite from '../user/accept-invite/accept-invite.service'
import Auth from './auth-management/auth-management.service'
import Avatar from './avatar/avatar.service'
import DiscordBotAuth from './discord-bot-auth/discord-bot-auth.service'
import Email from './email/email.service'
import IdentityProvider from './identity-provider/identity-provider.service'
import LoginToken from './login-token/login-token.service'
import Login from './login/login.service'
import MagicLink from './magic-link/magic-link.service'
import SMS from './sms/sms.service'
import UserApiKey from './user-api-key/user-api-key.service'
import UserRelationshipType from './user-relationship-type/user-relationship-type.service'
import UserRelationship from './user-relationship/user-relationship.service'
import UserSettings from './user-settings/user-settings.service'
import User from './user/user.service'

export default [
  UserApiKey,
  User,
  UserSettings,
  IdentityProvider,
  UserRelationshipType,
  UserRelationship,
  AcceptInvite,
  Auth,
  Avatar,
  Login,
  LoginToken,
  MagicLink,
  Email,
  SMS,
  DiscordBotAuth
]
