import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import { Sun } from "@styled-icons/fa-solid/Sun";
type AmbientLightNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene
 * ]
 * @type {[component class]}
 */
export default class AmbientLightNodeEditor extends Component<
  AmbientLightNodeEditorProps,
  {}
> {
  //iconComponent used to show icon image on the ambient light element
  static iconComponent = Sun;
  // shows this description in NodeEditor  with title of element 
  static description = "A light which illuminates all objects in your scene.";
  // used to change the color property of selected scene, when we change color property of ambient light
  onChangeColor = color => {
    (this.props.editor as any).setPropertySelected("color", color);
  };
  // used to change the intensity of selected scene
  onChangeIntensity = intensity => {
    (this.props.editor as any).setPropertySelected("intensity", intensity);
  };

  /**
   * [rendering ambient light view to customize ambient light element]
   */
  render() {
    const node = this.props.node;
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={AmbientLightNodeEditor.description}
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
          /* @ts-ignore */
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
      </NodeEditor>
    );
  }
}
