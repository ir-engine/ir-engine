import React from "react";

/**
 * [initializing EditorContext]
 */
export const EditorContext = React.createContext(null);

/**
 * [EditorContextProvider used to access value of component context]
 */
export const EditorContextProvider = EditorContext.Provider;

/**
 * [withEditor setting component context value]
 */
export function withEditor(Component) {
  return function EditorContextComponent(props) {
    return (
      <EditorContext.Consumer>
        {editor => <Component {...props} editor={editor} />}
      </EditorContext.Consumer>
    );
  };
}
