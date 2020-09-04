import React from "react";
export const DialogContext = React.createContext({
  showDialog: (DialogComponent, props) => {},
  hideDialog: () => {}
});
export const DialogContextProvider = DialogContext.Provider;
export function withDialog(DialogComponent) {
  return function DialogContextComponent(props) {
    return (
      <DialogContext.Consumer>
        {context => <DialogComponent {...props} {...context} />}
      </DialogContext.Consumer>
    );
  };
}
