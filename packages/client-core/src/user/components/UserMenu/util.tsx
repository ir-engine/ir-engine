import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { AvatarProps } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { State } from '@etherealengine/hyperflux/functions/StateFunctions'

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = '/placeholders/default-silhouette.svg'

export function getAvatarURLForUser(userAvatarDetails: State<Record<UserId, AvatarProps>>, userId?: UserId) {
  return (userId && userAvatarDetails[userId].thumbnailURL?.value) || DEFAULT_PROFILE_IMG_PLACEHOLDER
}
