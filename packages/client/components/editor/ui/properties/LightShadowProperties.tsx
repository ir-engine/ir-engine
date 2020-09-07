import React, { Component, Fragment } from "react";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import BooleanInput from "../inputs/BooleanInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import { Vector2 } from "three";
const ShadowMapResolutionOptions = [
  {
    label: "256px",
    value: new Vector2(256, 256)
  },
  {
    label: "512px",
    value: new Vector2(512, 512)
  },
  {
    label: "1024px",
    value: new Vector2(1024, 1024)
  },
  {
    label: "2048px",
    value: new Vector2(2048, 2048)
  },
  {
    label: "4096px (not recommended)",
    value: new Vector2(4096, 4096)
  }
];
type LightShadowPropertiesProps = {
  editor?: object;
  node?: object;
};
export default class LightShadowProperties extends Component<
  LightShadowPropertiesProps,
  {}
> {
  onChangeShadowMapResolution = shadowMapResolution => {
    (this.props.editor as any).setPropertySelected(
      "shadowMapResolution",
      shadowMapResolution
    );
  };
  onChangeCastShadow = castShadow => {
    (this.props.editor as any).setPropertySelected("castShadow", castShadow);
  };
  onChangeShadowBias = shadowBias => {
    (this.props.editor as any).setPropertySelected("shadowBias", shadowBias);
  };
  onChangeShadowRadius = shadowRadius => {
    (this.props.editor as any).setPropertySelected("shadowRadius", shadowRadius);
  };
  render() {
    const node = this.props.node;
    return (
      <Fragment>
        { /* @ts-ignore */ }
        <InputGroup name="Cast Shadow">
          <BooleanInput
            value={(node as any).castShadow}
            onChange={this.onChangeCastShadow}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Shadow Map Resolution">
          { /* @ts-ignore */ }
          <SelectInput
            options={ShadowMapResolutionOptions}
            value={(node as any).shadowMapResolution}
            onChange={this.onChangeShadowMapResolution}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Shadow Bias"
          mediumStep={0.00001}
          smallStep={0.0001}
          largeStep={0.001}
          displayPrecision={0.000001}
          /* @ts-ignore */
          value={node.shadowBias}
          onChange={this.onChangeShadowBias}
        />
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Shadow Radius"
          mediumStep={0.01}
          smallStep={0.1}
          largeStep={1}
          displayPrecision={0.0001}
          /* @ts-ignore */
          value={node.shadowRadius}
          onChange={this.onChangeShadowRadius}
        />
      </Fragment>
    );
  }
}
