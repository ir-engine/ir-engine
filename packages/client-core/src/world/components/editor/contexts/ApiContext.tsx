import React from "react";
import Api from "../Api";


/**
 * [
 * Context lets us pass a value deep into the component tree
 * without explicitly threading it through every component.
 * ApiContext used to context API component
 *    ]
 */
export const ApiContext = React.createContext<Api | undefined>(undefined);

/**
 * [withApi used to provide component context value by calling api ]
 */
export function withApi(Component) {
  return function ApiContextComponent(props) {
    return (
      <ApiContext.Consumer>
        {api => api ? <Component {...props} api={api} /> : <React.Fragment />}
      </ApiContext.Consumer>
    );
  };
}
