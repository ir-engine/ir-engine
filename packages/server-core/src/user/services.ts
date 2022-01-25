import AcceptInvite from '../user/accept-invite/accept-invite.service'
import Auth from './auth-management/auth-management.service'
import Avatar from './avatar/avatar.service'
import DiscordBotAuth from "./discord-bot-auth/discord-bot-auth.service";
import Email from './email/email.service'
import IdentityProvider from './identity-provider/identity-provider.service'
import InventoryItemType from './inventory-item-type/inventory-item-type.service'
import InventoryItem from './inventory-item/inventory-item.service'
import Login from './login/login.service'
import LoginToken from './login-token/login-token.service'
import MagicLink from './magic-link/magic-link.service'
import SMS from './sms/sms.service'
import User from './user/user.service'
import UserApiKey from './user-api-key/user-api-key.service'
import UserRelationship from './user-relationship/user-relationship.service'
import UserRelationshipType from './user-relationship-type/user-relationship-type.service'
import UserRole from './user-role/user-role.service'
import UserSettings from './user-settings/user-settings.service'
import UserInventory from './user-inventory/user-inventory.service'
import UserTrade from './user-trade/user-trade.service'

export default [
  UserRole,
  UserApiKey,
  User,
  UserSettings,
  IdentityProvider,
  UserRelationshipType,
  UserRelationship,
  InventoryItemType,
  InventoryItem,
  UserInventory,
  UserTrade,
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
