import { createState, useState } from '@hookstate/core'

export const LoadingSystemState = createState({
  opacity: 1
})
export const accessLoadingSystemState = () => LoadingSystemState
export const useLoadingSystemState = () =>
  useState(LoadingSystemState) as any as typeof LoadingSystemState as typeof LoadingSystemState
