

import React, { Component } from "react";
import Editor from "../Editor";
import InputGroup from "../inputs/InputGroup";
import { ControlledStringInput } from "../inputs/StringInput";
import NodeEditor from "./NodeEditor";
import i18n from "i18next";
import { withTranslation } from "react-i18next";
import { DoorOpen } from "@styled-icons/fa-solid";

type PortalNodeEditorProps = {
  editor?: Editor;
  node?: object;
  t: Function;
};

/**
 * PortalNodeEditor provides the editor for properties of PortalNode.
 * 
 * @author Josh Field <github.com/HexaField>
 * @type {class component}
 */
export class PortalNodeEditor extends Component<PortalNodeEditorProps, {}> {

 // initializing iconComponent image name
  static iconComponent = DoorOpen;

  //initializing description and will appears on PortalNodeEditor view
  static description = i18n.t('editor:properties.portal.description');

 // handle change in location property of PortalNode
 onChangeLocation = location => {
  this.props.editor.setPropertySelected("location", location);
};

  // handle change in displayText property of PortalNode
 onChangeDisplayText = displayText => {
   this.props.editor.setPropertySelected("displayText", displayText);
 };

  //rendering view of editor for properties of PortalNode
  render() {
    PortalNodeEditor.description = this.props.t('editor:properties.portal.description');
    const node = this.props.node;
    return (
      /* @ts-ignore */
      <NodeEditor description={PortalNodeEditor.description} {...this.props}>
        { /* @ts-ignore */ }
        <InputGroup name="Location" label={this.props.t('editor:properties.portal.location')}>
          { /* @ts-ignore */ }
          <ControlledStringInput value={node.location} onChange={this.onChangeLocation} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Display Text" label={this.props.t('editor:properties.portal.displayText')}>
          { /* @ts-ignore */ }
          <ControlledStringInput value={node.displayText} onChange={this.onChangeDisplayText} />
        </InputGroup>
      </NodeEditor>
    );
  }
}

export default withTranslation()(PortalNodeEditor);