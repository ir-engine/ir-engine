
/**
 * @author HydraFire <github.com/HydraFire>
 */

export enum CollisionGroups {
  None = 0,
	Default = 1 << 0,
	Characters = 1 << 1,
	Car = 1 << 2,
	TrimeshColliders = 1 << 3,
	ActiveCollider = 1 << 4,
  All = Default | Characters | Car | TrimeshColliders | ActiveCollider
}
