import { Link } from "@styled-icons/fa-solid/Link";
import React, { Component } from "react";
import Editor from "../Editor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import NodeEditor from "./NodeEditor";

//declairing properties for LinkNodeEditor
type LinkNodeEditorProps = {
  editor?: Editor;
  node?: object;
};

/**
 * [LinkNodeEditor provides the editor for properties of LinkNode]
 * @type {class component}
 */
export default class LinkNodeEditor extends Component<LinkNodeEditorProps, {}> {

 // initializing iconComponent image name
  static iconComponent = Link;

  //initializing description and will appears on LinkNodeEditor view
  static description = `Link to a room or a website.`;

 //function to handle change in href property of LinkNode
  onChangeHref = href => {
    this.props.editor.setPropertySelected("href", href);
  };

  //rendering view of editor for properties of LinkNode
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
