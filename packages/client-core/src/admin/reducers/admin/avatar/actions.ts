export const AVATARS_RETRIEVED = 'AVATARS_RETRIEVED'

export interface AvatarsFetchedAction {
  type: string
  avatars: any[]
}

export function avatarsFetched(avatars: any[]): AvatarsFetchedAction {
  return {
    type: AVATARS_RETRIEVED,
    avatars: avatars
  }
}
