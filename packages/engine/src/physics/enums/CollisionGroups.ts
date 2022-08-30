export enum CollisionGroups {
  None = 0,
  Default = 1 << 0,
  Avatars = 1 << 1,
  Ground = 1 << 2,
  Trigger = 1 << 3
}

export const DefaultCollisionMask = CollisionGroups.Default | CollisionGroups.Avatars | CollisionGroups.Ground

export const AvatarCollisionMask = CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger
