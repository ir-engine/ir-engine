import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import { HandPaper } from "@styled-icons/fa-solid/HandPaper";
import i18n from "i18next";
import { withTranslation } from "react-i18next";
type BoxColliderNodeEditorProps = {
  editor?: object;
  node?: object;
  t: Function;
};

/**
 * BoxColliderNodeEditor is used to provide properties to customize box collider element.
 * 
 * @author Robert Long
 * @type {[component class]}
 */
export class BoxColliderNodeEditor extends Component<
  BoxColliderNodeEditorProps,
  {}
> {
  //defining iconComponent with component name
  static iconComponent = HandPaper;

  //defining description and shows this description in NodeEditor  with title of elementt,
  // available to add in scene in assets.
  static description = i18n.t('editor:properties.boxCollider.description');
  // function to handle the changes on walkable property
  onChangeWalkable = walkable => {
    (this.props.editor as any).setPropertySelected("walkable", walkable);
  };
  //rendering view to cusomize box collider element
  render() {
    BoxColliderNodeEditor.description = this.props.t('editor:properties.boxCollider.description');

    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={BoxColliderNodeEditor.description}
      >
        { /* @ts-ignore */ }
        <InputGroup name="Walkable" label={this.props.t('editor:properties.boxCollider.lbl-walkable')}>
          <BooleanInput
            value={(this.props.node as any).walkable}
            onChange={this.onChangeWalkable}
          />
        </InputGroup>
      </NodeEditor>
    );
  }
}

export default withTranslation()(BoxColliderNodeEditor);
