import { useCallback } from "react";

//function used to setting changes in editor properties
export default function useSetPropertySelected(editor, propName) {
  return useCallback(value => editor.setPropertySelected(propName, value), [
    editor,
    propName
  ]);
}
