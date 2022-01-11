import { createContext, useContext } from 'react'

export const DialogContext = createContext<[JSX.Element | null, (c: JSX.Element | null) => void]>([null, () => {}])

export const useDialog = () => {
  return useContext(DialogContext)
}
