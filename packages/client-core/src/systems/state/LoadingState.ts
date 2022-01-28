import { createState, useState } from '@speigg/hookstate'

export const LoadingSystemState = createState({
  opacity: 1
})
export const accessLoadingSystemState = () => LoadingSystemState
export const useLoadingSystemState = () =>
  useState(LoadingSystemState) as any as typeof LoadingSystemState as typeof LoadingSystemState
