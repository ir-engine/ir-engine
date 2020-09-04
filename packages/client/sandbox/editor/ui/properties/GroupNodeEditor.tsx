import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Cubes } from "@styled-icons/fa-solid/Cubes";
type GroupNodeEditorProps = {
  editor?: object,
  node?: object
};
export default class GroupNodeEditor extends Component<
  GroupNodeEditorProps,
  {}
> {
  render() {
    return (
      <NodeEditor {...this.props} description={GroupNodeEditor.description} />
    );
  }
}
