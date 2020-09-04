import React, { Component } from "react";
import configs from "../../configs";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import { Link } from "@styled-icons/fa-solid/Link";
type LinkNodeEditorProps = {
  editor?: object,
  node?: object
};
export default class LinkNodeEditor extends Component<LinkNodeEditorProps, {}> {
  onChangeHref = href => {
    this.props.editor.setPropertySelected("href", href);
  };
  render() {
    const node = this.props.node;
    return (
      <NodeEditor description={LinkNodeEditor.description} {...this.props}>
        <InputGroup name="Url">
          <StringInput value={node.href} onChange={this.onChangeHref} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
