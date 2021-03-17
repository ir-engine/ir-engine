import React, { useCallback } from "react";
import PropTypes from "prop-types";
import SketchPicker from "react-color/lib/Sketch";
import Input from "./Input";
import { Color } from "three";
import styled from "styled-components";
import Popover from "../layout/Popover";

/**
 * [ColorInputContainer used to provide styles for ColorInputContainer div]
 * @type {styled component}
 */
const ColorInputContainer = (styled as any).div`
  display: flex;
  position: relative;
  width: 100%;
  max-width: 100px;
`;

/**
 * [StyledColorInput used to provide styles for StyledColorInput div]
 * @type {styled component}
 */
const StyledColorInput = (styled as any)(Input)`
  display: flex;
  flex: 1;
  align-items: center;
`;

/**
 * [ColorPreview used to provide styles for ColorPreview div]
 * @type {styled component}
 */
const ColorPreview = (styled as any).div`
  width: 32px;
  height: auto;
  border-radius: 2px;
  padding: 6px;
  margin-right: 8px;
`;

/**
 * [ColorText used to provide styles for ColorText div]
 * @type {styled component}
 */
const ColorText = (styled as any).div`
  padding-top: 2px;
`;

/**
 * [ColorInputPopover used to provide styles for ColorText popover]
 * @type {styled component}
 */
const ColorInputPopover = (styled as any).div`
  box-shadow: ${props => props.theme.shadow30};
  margin-bottom: 3px;
`;

/**
 * [ColorInput used to render the view of component]
 * @param       {object} value
 * @param       {function} onChange
 * @param       {boolean} disabled
 * @param       {any} rest
 * @constructor
 */

export default function ColorInput({ value, onChange, disabled, ...rest }) {
  const onChangePicker = useCallback(
    ({ hex }) => {
      onChange(new Color(hex));
    },
    [onChange]
  );

  //initializing hexColor by getting hexString
  const hexColor = "#" + value.getHexString();

  //creating view for ColorInput
  return (
    <ColorInputContainer>
    { /* @ts-ignore */ }
      <Popover
        disabled={disabled}
        renderContent={() => (
          <ColorInputPopover>
            <SketchPicker {...rest} color={hexColor} disableAlpha={true} onChange={onChangePicker} />
          </ColorInputPopover>
        )}
      >
        <StyledColorInput as="div" disabled={disabled}>
          <ColorPreview style={{ background: hexColor }} />
          <ColorText>{hexColor.toUpperCase()}</ColorText>
        </StyledColorInput>
      </Popover>
    </ColorInputContainer>
  );
}

/**
 * [declairing propTypes for ColorInput]
 * @type {Object}
 */
ColorInput.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func
};

/**
 * [initializing defaultProps for ColorInput]
 * @type {Object}
 */
ColorInput.defaultProps = {
  value: new Color(),
  onChange: () => {}
};
