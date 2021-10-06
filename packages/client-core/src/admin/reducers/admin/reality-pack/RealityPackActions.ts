export const RealityPackAction = {
  realityPacksFetched: (realityPacks: any[]) => {
    return {
      type: 'REALITY_PACKS_RETRIEVED' as const,
      realityPacks: realityPacks
    }
  }
}

export type RealityPackActionType = ReturnType<typeof RealityPackAction[keyof typeof RealityPackAction]>
