export const AvatarAction = {
  avatarsFetched: (avatars: any[]) => {
    return {
      type: 'AVATARS_RETRIEVED' as const,
      avatars: avatars
    }
  }
}
export type AvatarActionType = ReturnType<typeof AvatarAction[keyof typeof AvatarAction]>
