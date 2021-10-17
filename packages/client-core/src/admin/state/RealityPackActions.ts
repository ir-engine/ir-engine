import { AdminRealityPackResult } from '@xrengine/common/src/interfaces/AdminRealityPackResult'

export const RealityPackAction = {
  realityPacksFetched: (adminRealityPackResult: AdminRealityPackResult) => {
    return {
      type: 'REALITY_PACKS_RETRIEVED' as const,
      adminRealityPackResult: adminRealityPackResult
    }
  }
}

export type RealityPackActionType = ReturnType<typeof RealityPackAction[keyof typeof RealityPackAction]>
