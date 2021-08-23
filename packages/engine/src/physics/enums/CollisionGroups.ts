/**
 * @author HydraFire <github.com/HydraFire>
 */

export enum CollisionGroups {
  None = 0,
  Default = 1 << 0,
  Avatars = 1 << 1,
  Car = 1 << 2,
  Ground = 1 << 3,
  Trigger = 1 << 4
}

export const DefaultCollisionMask = CollisionGroups.Default | CollisionGroups.Avatars | CollisionGroups.Ground
