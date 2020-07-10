import { User } from './User'

export type Invite = {
  id: string
  invitee: User
  token: string
  inviter: User
}

export const InviteSeed = {
  id: ''
}

// export function resolveInvite (invite: any): User {
//   let returned = user
//   if (user && user.identity_providers) {
//     returned = {
//       ...returned,
//       identityProviders: user.identity_providers
//     }
//   }
//   if (user && user.subscriptions && user.subscriptions.length > 0) {
//     const verifiedSubscription = user.subscriptions.find(item => item.status === true)
//     returned = {
//       ...returned,
//       subscription: verifiedSubscription
//     }
//     delete returned.subscriptions
//   }
//   return returned
// }
