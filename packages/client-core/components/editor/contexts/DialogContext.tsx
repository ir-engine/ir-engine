import React from "react";

/**
 * [DialogContext creating context using react]
 */
export const DialogContext = React.createContext({
  showDialog: (DialogComponent, props) => {},
  hideDialog: () => {}
});

/**
 * [DialogContextProvider provides component context value]
 */
export const DialogContextProvider = DialogContext.Provider;

/**
 * [withDialog used to customize component using context]
 */
export function withDialog(DialogComponent) {
  return function DialogContextComponent(props) {
    return (
      <DialogContext.Consumer>
        {context => <DialogComponent {...props} {...context} />}
      </DialogContext.Consumer>
    );
  };
}
