import { createContext, useContext } from 'react'

export const DialogContext = createContext(null)

export const useDialog = () => {
  return useContext(DialogContext) as [JSX.Element, (c: JSX.Element) => void]
}
