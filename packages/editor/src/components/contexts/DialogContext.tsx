import React from 'react'

/**
 * DialogContext creating context using react.
 *
 * @author Robert Long
 */
export const DialogContext = React.createContext({
  showDialog: (DialogComponent, props) => {},
  hideDialog: () => {}
})

/**
 * DialogContextProvider provides component context value.
 *
 * @author Robert Long
 */
export const DialogContextProvider = DialogContext.Provider

/**
 * withDialog used to customize component using context.
 *
 * @author Robert Long
 */
export function withDialog(DialogComponent) {
  return function DialogContextComponent(props) {
    return <DialogContext.Consumer>{(context) => <DialogComponent {...props} {...context} />}</DialogContext.Consumer>
  }
}
