/** Types of System Update
 *
 * @author Josh Field, Gheric Speiginer
 */

export const SystemUpdateType = {
  UPDATE: 'UPDATE' as const,
  FIXED_EARLY: 'FIXED_EARLY' as const,
  FIXED: 'FIXED' as const,
  FIXED_LATE: 'FIXED_LATE' as const,
  PRE_RENDER: 'PRE_RENDER' as const,
  POST_RENDER: 'POST_RENDER' as const
}

export type SystemUpdateType = keyof typeof SystemUpdateType
