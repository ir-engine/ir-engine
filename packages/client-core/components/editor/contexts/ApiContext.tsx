import React from "react";
import Api from "../Api";
export const ApiContext = React.createContext<Api | undefined>(undefined);
export function withApi(Component) {
  return function ApiContextComponent(props) {
    return (
      <ApiContext.Consumer>
        {api => api ? <Component {...props} api={api} /> : <React.Fragment />}
      </ApiContext.Consumer>
    );
  };
}
