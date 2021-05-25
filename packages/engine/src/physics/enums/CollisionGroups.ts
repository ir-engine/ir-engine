
/**
 * @author HydraFire <github.com/HydraFire>
 */

export enum CollisionGroups {
  None = 0,
	Default = 1 << 0,
	Characters = 1 << 1,
	Car = 1 << 2,
	TrimeshColliders = 1 << 3,
	TriggerCollider = 1 << 4,
  Ground = 1 << 5,
}

export const DefaultCollisionMask = CollisionGroups.Default | CollisionGroups.Characters | CollisionGroups.Ground | CollisionGroups.TrimeshColliders;