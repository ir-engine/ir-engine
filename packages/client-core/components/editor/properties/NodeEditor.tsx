import React, { Component } from "react";
import PropertyGroup from "./PropertyGroup";
type NodeEditorProps = {
  name?: string;
  description?: string;
  node?: object;
  editor?: object;
  disableTransform?: boolean;
};
export default class NodeEditor extends Component<NodeEditorProps, {}> {
  render() {
    const { node, description, children } = this.props as any;
    return (
      <PropertyGroup name={node.nodeName} description={description}>
        {children}
      </PropertyGroup>
    );
  }
}
