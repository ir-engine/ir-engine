import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Circle } from "@styled-icons/fa-solid/Circle";
type DefaultNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * DefaultNodeEditor  used to render view when no element is selected
 * 
 * @author Robert Long
 */
export default class DefaultNodeEditor extends Component<
  DefaultNodeEditorProps,
  {}
> {
  render() {
    return <NodeEditor {...this.props} />;
  }
}
