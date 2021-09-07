import React from 'react'

/**
 * initializing EditorContext.
 *
 * @author Robert Long
 */
export const EditorContext = React.createContext(null)

/**
 * EditorContextProvider used to access value of component context.
 *
 * @author Robert Long
 */
export const EditorContextProvider = EditorContext.Provider

/**
 * withEditor setting component context value.
 *
 * @author Robert Long
 */
export function withEditor(Component) {
  return function EditorContextComponent(props) {
    return <EditorContext.Consumer>{(editor) => <Component {...props} editor={editor} />}</EditorContext.Consumer>
  }
}
