import React, { Component } from "react";
import configs from "@xr3ngine/engine/src/editor/configs";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import { Link } from "@styled-icons/fa-solid/Link";
type LinkNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class LinkNodeEditor extends Component<LinkNodeEditorProps, {}> {
  onChangeHref = href => {
    (this.props.editor as any).setPropertySelected("href", href);
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
