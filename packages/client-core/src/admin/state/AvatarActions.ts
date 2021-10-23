import { AvatarResult } from '@xrengine/common/src/interfaces/AvatarResult'

export const AvatarAction = {
  avatarsFetched: (avatars: AvatarResult) => {
    return {
      type: 'AVATARS_RETRIEVED' as const,
      avatars: avatars
    }
  }
}
export type AvatarActionType = ReturnType<typeof AvatarAction[keyof typeof AvatarAction]>
