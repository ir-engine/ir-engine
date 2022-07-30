/**
 * Types of System Update
 */

export const SystemUpdateType = {
  // TODO: refactor this to look more like Unity's System Ordering Attributes
  // and default system groups (see https://docs.unity3d.com/Packages/com.unity.entities@0.2/manual/system_update_order.html#tips-and-best-practices)
  UPDATE_EARLY: 'UPDATE_EARLY' as const,
  UPDATE: 'UPDATE' as const,
  UPDATE_LATE: 'UPDATE_LATE' as const,
  FIXED_EARLY: 'FIXED_EARLY' as const,
  FIXED: 'FIXED' as const,
  FIXED_LATE: 'FIXED_LATE' as const,
  PRE_RENDER: 'PRE_RENDER' as const,
  RENDER: 'RENDER' as const,
  POST_RENDER: 'POST_RENDER' as const
}

export type SystemUpdateType = keyof typeof SystemUpdateType
