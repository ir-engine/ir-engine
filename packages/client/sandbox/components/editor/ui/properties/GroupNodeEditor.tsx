import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
type GroupNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class GroupNodeEditor extends Component<
  GroupNodeEditorProps,
  {}
> {
  render() {
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={GroupNodeEditor.description} />
    );
  }
}
