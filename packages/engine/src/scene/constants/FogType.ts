export const FogType = {
  Disabled: 'disabled' as const,
  Linear: 'linear' as const,
  Exponential: 'exponential' as const
}

export type FogTypeType = typeof FogType.Disabled | typeof FogType.Linear | typeof FogType.Exponential
