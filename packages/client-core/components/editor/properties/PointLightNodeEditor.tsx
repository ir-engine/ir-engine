// @ts-nocheck

import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import LightShadowProperties from "./LightShadowProperties";
import { Lightbulb } from "@styled-icons/fa-solid/Lightbulb";

//Declairing properties for PointLightNodeEditor
type PointLightNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [PointLightNodeEditor is used render editor view to customize component properties]
 * @type {class component}
 */
export default class PointLightNodeEditor extends Component<
  PointLightNodeEditorProps,
  {}
> {

  //initializing iconComponent icon name
  static iconComponent = Lightbulb;

  //initializing description will appears on editor view
  static description = "A light which emits in all directions from a single point.";

  //function to handle changes in color property
  onChangeColor = color => {
    (this.props.editor as any).setPropertySelected("color", color);
  };

  //function to handle changes in intensity
  onChangeIntensity = intensity => {
    (this.props.editor as any).setPropertySelected("intensity", intensity);
  };

  //function to handle changes on range property
  onChangeRange = range => {
    (this.props.editor as any).setPropertySelected("range", range);
  };
  render() {
    const { node, editor } = this.props as any;
    return (
      <NodeEditor
        {...this.props}
        description={PointLightNodeEditor.description}
      >
        <InputGroup name="Color">
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
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
        <NumericInputGroup
          name="Range"
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.range}
          onChange={this.onChangeRange}
          unit="m"
        />
        <LightShadowProperties node={node} editor={editor} />
      </NodeEditor>
    );
  }
}
