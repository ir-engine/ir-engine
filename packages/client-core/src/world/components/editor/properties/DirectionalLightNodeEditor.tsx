import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import LightShadowProperties from "./LightShadowProperties";
import { Bolt } from "@styled-icons/fa-solid/Bolt";

/**
 * [Defining properties for DirectionalLightNodeEditor]
 * @type {Object}
 */
type DirectionalLightNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [DirectionalLightNodeEditor is used provides  properties to customize DirectionaLight element]
 * @type {Component class}
 */
export default class DirectionalLightNodeEditor extends Component<
  DirectionalLightNodeEditorProps,
  {}
> {
  //defining icon component name
  static iconComponent = Bolt;

  //setting description and will appears on the node editor.
  static description = "A light which illuminates the entire scene, but emits along a single direction.";

  //function to handle changes in color property
  onChangeColor = color => {
    (this.props.editor as any).setPropertySelected("color", color);
  };
  //function to handle the changes in intensity property of DirectionalLight
  onChangeIntensity = intensity => {
    (this.props.editor as any).setPropertySelected("intensity", intensity);
  };

  // renders editor view, provides inputs to customize properties of DirectionalLight element.
  render() {
    const { node, editor } = this.props as any;
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={DirectionalLightNodeEditor.description}
      >
        { /* @ts-ignore */ }
        <InputGroup name="Color">
          { /* @ts-ignore */ }
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Intensity"
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
        <LightShadowProperties node={node} editor={editor} />
      </NodeEditor>
    );
  }
}
