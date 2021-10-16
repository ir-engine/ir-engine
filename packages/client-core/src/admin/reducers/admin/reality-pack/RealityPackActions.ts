import { RealityPackResult } from '@xrengine/common/src/interfaces/RealityPackResult'

export const RealityPackAction = {
  realityPacksFetched: (realityPackResult: RealityPackResult) => {
    return {
      type: 'REALITY_PACKS_RETRIEVED' as const,
      realityPackResult: realityPackResult
    }
  }
}

export type RealityPackActionType = ReturnType<typeof RealityPackAction[keyof typeof RealityPackAction]>
