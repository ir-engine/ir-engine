export const REALITY_PACKS_RETRIEVED = 'REALITY_PACKS_RETRIEVED'

export interface RealityPacksFetchedAction {
  type: string
  realityPacks: any[]
}

export function realityPacksFetched(realityPacks: any[]): RealityPacksFetchedAction {
  return {
    type: REALITY_PACKS_RETRIEVED,
    realityPacks: realityPacks
  }
}
