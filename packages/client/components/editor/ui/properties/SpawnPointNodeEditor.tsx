import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
type SpawnPointNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class SpawnPointNodeEditor extends Component<
  SpawnPointNodeEditorProps,
  {}
> {
  render() {
    return (
      <NodeEditor
      /* @ts-ignore */
        description={SpawnPointNodeEditor.description}
        {...this.props}
      />
    );
  }
}
