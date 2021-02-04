import { Link } from "@styled-icons/fa-solid/Link";
import React, { Component } from "react";
import Editor from "../Editor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import NodeEditor from "./NodeEditor";
type LinkNodeEditorProps = {
  editor?: Editor;
  node?: object;
};
export default class LinkNodeEditor extends Component<LinkNodeEditorProps, {}> {
  static iconComponent = Link;
  static description = `Link to a room or a website.`;
  onChangeHref = href => {
    this.props.editor.setPropertySelected("href", href);
  };
  render() {
    const node = this.props.node;
    return (
      /* @ts-ignore */
      <NodeEditor description={LinkNodeEditor.description} {...this.props}>
        { /* @ts-ignore */ }
        <InputGroup name="Url">
          { /* @ts-ignore */ }
          <StringInput value={node.href} onChange={this.onChangeHref} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
