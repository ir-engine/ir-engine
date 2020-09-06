import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Circle } from "@styled-icons/fa-solid/Circle";
type DefaultNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class DefaultNodeEditor extends Component<
  DefaultNodeEditorProps,
  {}
> {
  render() {
    return <NodeEditor {...this.props} />;
  }
}
